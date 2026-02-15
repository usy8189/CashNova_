const router = require('express').Router();
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const cache = require('../utils/cache');

const transactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1),
    description: z.string().min(1).max(500),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
});

// POST /api/transactions
router.post('/', authenticate, validate(transactionSchema), async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.validatedBody;
        const tx = await prisma.transaction.create({
            data: {
                userId: req.userId,
                amount,
                type,
                category,
                description,
                transactionDate: new Date(date),
            },
        });
        // Invalidate cached analytics/insights for this user
        cache.invalidate(`insights:${req.userId}`);
        cache.invalidate(`predictions:${req.userId}`);
        cache.invalidate(`alerts:${req.userId}`);
        cache.invalidate(`analytics:${req.userId}`);
        res.status(201).json(tx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, category, sort = 'date', order = 'desc', search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { userId: req.userId };
        if (type && type !== 'all') where.type = type;
        if (category && category !== 'all') where.category = category;
        if (search) {
            where.OR = [
                { description: { contains: search } },
                { category: { contains: search } },
            ];
        }

        const orderBy = sort === 'amount'
            ? { amount: order }
            : sort === 'description'
                ? { description: order }
                : { transactionDate: order };

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                orderBy,
                skip,
                take: parseInt(limit),
            }),
            prisma.transaction.count({ where }),
        ]);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/transactions/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const tx = await prisma.transaction.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });
        if (!tx) return res.status(404).json({ error: 'Transaction not found' });
        res.json(tx);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/transactions/:id
router.patch('/:id', authenticate, async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.body;
        const tx = await prisma.transaction.updateMany({
            where: { id: req.params.id, userId: req.userId },
            data: {
                ...(amount && { amount }),
                ...(type && { type }),
                ...(category && { category }),
                ...(description && { description }),
                ...(date && { transactionDate: new Date(date) }),
            },
        });
        if (tx.count === 0) return res.status(404).json({ error: 'Transaction not found' });
        const updated = await prisma.transaction.findUnique({ where: { id: req.params.id } });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/transactions/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const tx = await prisma.transaction.deleteMany({
            where: { id: req.params.id, userId: req.userId },
        });
        if (tx.count === 0) return res.status(404).json({ error: 'Transaction not found' });
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
