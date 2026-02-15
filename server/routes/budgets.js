const router = require('express').Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');

const budgetSchema = z.object({
    categoryName: z.string().min(1),
    monthlyLimit: z.number().positive(),
    month: z.string().regex(/^\d{4}-\d{2}$/),
});

// POST /api/budgets
router.post('/', authenticate, validate(budgetSchema), async (req, res) => {
    try {
        const { categoryName, monthlyLimit, month } = req.validatedBody;
        const budget = await prisma.budget.create({
            data: { userId: req.userId, categoryName, monthlyLimit, month },
        });
        res.status(201).json(budget);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/budgets
router.get('/', authenticate, async (req, res) => {
    try {
        const { month } = req.query;
        const where = { userId: req.userId };
        if (month) where.month = month;

        const budgets = await prisma.budget.findMany({ where });

        // Compute spent for each budget
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId, type: 'expense' },
        });

        const enriched = budgets.map((b) => {
            const spent = transactions
                .filter((t) => t.category === b.categoryName)
                .reduce((s, t) => s + t.amount, 0);
            return { ...b, spent, remaining: b.monthlyLimit - spent, percentage: (spent / b.monthlyLimit) * 100 };
        });

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/budgets/:id
router.patch('/:id', authenticate, async (req, res) => {
    try {
        const { monthlyLimit, month, categoryName } = req.body;
        const budget = await prisma.budget.updateMany({
            where: { id: req.params.id, userId: req.userId },
            data: {
                ...(monthlyLimit && { monthlyLimit }),
                ...(month && { month }),
                ...(categoryName && { categoryName }),
            },
        });
        if (budget.count === 0) return res.status(404).json({ error: 'Budget not found' });
        const updated = await prisma.budget.findUnique({ where: { id: req.params.id } });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const budget = await prisma.budget.deleteMany({
            where: { id: req.params.id, userId: req.userId },
        });
        if (budget.count === 0) return res.status(404).json({ error: 'Budget not found' });
        res.json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
