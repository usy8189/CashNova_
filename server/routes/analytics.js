const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const cache = require('../utils/cache');

// GET /api/analytics/summary
router.get('/summary', authenticate, async (req, res) => {
    try {
        const cacheKey = `analytics:summary:${req.userId}`;
        const cached = cache.get(cacheKey);
        if (cached) return res.json(cached);

        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
        });

        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        const result = { income, expense, balance: income - expense, transactionCount: transactions.length };
        cache.set(cacheKey, result, 3 * 60 * 1000);
        res.json(result);
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
                where: { userId: req.userId, transactionDate: { gte: thisMonth } },
            }),
            prisma.transaction.findMany({
                where: { userId: req.userId, transactionDate: { gte: lastMonth, lt: thisMonth } },
            }),
        ]);

        const calc = (txs) => ({
            income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        });

        res.json({ thisMonth: calc(thisMonthTx), lastMonth: calc(lastMonthTx) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/weekly-comparison
router.get('/weekly-comparison', authenticate, async (req, res) => {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now - 7 * 86400000);
        const twoWeeksAgo = new Date(now - 14 * 86400000);

        const [thisWeekTx, lastWeekTx] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId: req.userId, type: 'expense', transactionDate: { gte: oneWeekAgo } },
            }),
            prisma.transaction.findMany({
                where: { userId: req.userId, type: 'expense', transactionDate: { gte: twoWeeksAgo, lt: oneWeekAgo } },
            }),
        ]);

        const sum = txs => txs.reduce((s, t) => s + t.amount, 0);
        res.json({
            thisWeek: sum(thisWeekTx),
            lastWeek: sum(lastWeekTx),
            change: sum(lastWeekTx) > 0
                ? Math.round(((sum(thisWeekTx) - sum(lastWeekTx)) / sum(lastWeekTx)) * 100)
                : 0,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/daily-breakdown
router.get('/daily-breakdown', authenticate, async (req, res) => {
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: req.userId,
                type: 'expense',
                transactionDate: { gte: monthStart },
            },
        });

        const dailyMap = {};
        transactions.forEach(t => {
            const day = new Date(t.transactionDate).toISOString().slice(0, 10);
            dailyMap[day] = (dailyMap[day] || 0) + t.amount;
        });

        const days = Object.entries(dailyMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        res.json(days);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
