const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');
const axios = require('axios');

// GET /api/insights
router.get('/', authenticate, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId },
            orderBy: { transactionDate: 'desc' },
        });

        const budgets = await prisma.budget.findMany({
            where: { userId: req.userId },
        });

        const insights = [];

        // --- Rule-based insights ---
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;

        if (savingsRate > 30) {
            insights.push({ message: `Excellent! You're saving ${savingsRate}% of your income.`, type: 'positive' });
        } else if (savingsRate > 10) {
            insights.push({ message: `You're saving ${savingsRate}% of your income. Target 30% for financial health.`, type: 'info' });
        } else if (savingsRate > 0) {
            insights.push({ message: `Low savings rate: ${savingsRate}%. Consider reducing non-essential expenses.`, type: 'warning' });
        } else {
            insights.push({ message: `You're spending more than you earn! Review your expenses immediately.`, type: 'negative' });
        }

        // Category analysis
        const categoryMap = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        if (sortedCategories.length > 0) {
            const [topCat, topAmount] = sortedCategories[0];
            const pct = ((topAmount / expense) * 100).toFixed(0);
            insights.push({
                message: `Your highest expense category is "${topCat}" at ${pct}% of total spending.`,
                type: 'info',
            });
        }

        // Budget alerts
        budgets.forEach(b => {
            const spent = transactions
                .filter(t => t.type === 'expense' && t.category === b.categoryName)
                .reduce((s, t) => s + t.amount, 0);
            const pct = (spent / b.monthlyLimit) * 100;

            if (pct > 100) {
                insights.push({
                    message: `🚨 ${b.categoryName} budget exceeded! Spent ₹${spent.toLocaleString()} of ₹${b.monthlyLimit.toLocaleString()} limit.`,
                    type: 'negative',
                });
            } else if (pct > 80) {
                insights.push({
                    message: `⚠️ "${b.categoryName}" budget is ${pct.toFixed(0)}% used. Slow down spending.`,
                    type: 'warning',
                });
            }
        });

        // --- Try ML predictions ---
        try {
            const mlUrl = process.env.ML_SERVICE_URL;
            if (mlUrl) {
                const monthlyExpenses = {};
                transactions.filter(t => t.type === 'expense').forEach(t => {
                    const month = t.transactionDate.toISOString().slice(0, 7);
                    monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
                });

                const amounts = Object.values(monthlyExpenses);
                if (amounts.length >= 2) {
                    const predictionRes = await axios.post(`${mlUrl}/predict`, { amounts }, { timeout: 5000 });
                    if (predictionRes.data?.forecast) {
                        insights.push({
                            message: `📈 AI Forecast: Your predicted spending next month is ₹${Math.round(predictionRes.data.forecast).toLocaleString()}.`,
                            type: 'info',
                        });
                    }
                }
            }
        } catch {
            // ML service unavailable, skip ML insights
        }

        res.json(insights);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/predictions
router.get('/predictions', authenticate, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.userId, type: 'expense' },
        });

        const monthlyExpenses = {};
        transactions.forEach(t => {
            const month = t.transactionDate.toISOString().slice(0, 7);
            monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
        });

        const amounts = Object.values(monthlyExpenses);

        // Simple moving average fallback
        if (amounts.length < 2) {
            return res.json({ forecast: amounts[0] || 0, confidence: 'low', method: 'insufficient_data' });
        }

        const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const trend = amounts[amounts.length - 1] - amounts[amounts.length - 2];

        res.json({
            forecast: Math.round(avg + trend * 0.5),
            monthlyData: Object.entries(monthlyExpenses).map(([month, amount]) => ({ month, amount })),
            confidence: amounts.length > 3 ? 'medium' : 'low',
            method: 'moving_average_with_trend',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
