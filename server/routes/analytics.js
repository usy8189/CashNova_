const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

// GET /api/analytics/summary
router.get('/summary', authenticate, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
        });

        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        res.json({ income, expense, balance: income - expense, transactionCount: transactions.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/category-breakdown
router.get('/category-breakdown', authenticate, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId, type: 'expense' },
        });

        const map = {};
        transactions.forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });

        const breakdown = Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        res.json(breakdown);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/trends
router.get('/trends', authenticate, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            orderBy: { transactionDate: 'asc' },
        });

        const map = {};
        transactions.forEach(t => {
            const month = t.transactionDate.toISOString().slice(0, 7);
            if (!map[month]) map[month] = { month, income: 0, expense: 0 };
            if (t.type === 'income') map[month].income += t.amount;
            else map[month].expense += t.amount;
        });

        res.json(Object.values(map));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/monthly-comparison
router.get('/monthly-comparison', authenticate, async (req, res) => {
    try {
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [thisMonthTx, lastMonthTx] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    userId: req.userId,
                    transactionDate: { gte: thisMonth },
                },
            }),
            prisma.transaction.findMany({
                where: {
                    userId: req.userId,
                    transactionDate: { gte: lastMonth, lt: thisMonth },
                },
            }),
        ]);

        const calc = (txs) => ({
            income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        });

        res.json({
            thisMonth: calc(thisMonthTx),
            lastMonth: calc(lastMonthTx),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
