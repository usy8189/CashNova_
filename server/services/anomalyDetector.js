const prisma = require('../utils/prisma');

/**
 * Detects anomalous spending patterns using statistical analysis.
 * Returns an array of { message, type, severity } alert objects.
 */
async function detectAnomalies(userId) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 86400000);
    const ninetyDaysAgo = new Date(now - 90 * 86400000);

    const recentExpenses = await prisma.transaction.findMany({
        where: {
            userId,
            type: 'expense',
            transactionDate: { gte: ninetyDaysAgo },
        },
        orderBy: { transactionDate: 'desc' },
    });

    if (recentExpenses.length < 5) {
        return []; // Not enough data for analysis
    }

    const alerts = [];

    // ─── 1. Large Transaction Detection ───
    // Flag transactions > 2 standard deviations above the mean for their category
    const categoryTxns = {};
    recentExpenses.forEach(t => {
        if (!categoryTxns[t.category]) categoryTxns[t.category] = [];
        categoryTxns[t.category].push(t);
    });

    const todayExpenses = recentExpenses.filter(t => {
        const d = new Date(t.transactionDate);
        return d.toDateString() === now.toDateString();
    });

    for (const [category, txns] of Object.entries(categoryTxns)) {
        if (txns.length < 3) continue;

        const amounts = txns.map(t => t.amount);
        const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const stdDev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - mean, 2), 0) / amounts.length);

        // Check if any today's transactions in this category are outliers
        const todayCatTxns = todayExpenses.filter(t => t.category === category);
        todayCatTxns.forEach(t => {
            if (stdDev > 0 && (t.amount - mean) / stdDev > 2) {
                alerts.push({
                    message: `Unusually large ${category} expense: ₹${t.amount.toLocaleString()} (avg is ₹${Math.round(mean).toLocaleString()}).`,
                    type: 'warning',
                    severity: 'high',
                });
            }
        });
    }

    // ─── 2. Daily Spending Spike ───
    const dailyTotals = {};
    recentExpenses.forEach(t => {
        const day = new Date(t.transactionDate).toISOString().slice(0, 10);
        dailyTotals[day] = (dailyTotals[day] || 0) + t.amount;
    });

    const dailyAmounts = Object.values(dailyTotals);
    if (dailyAmounts.length >= 7) {
        const dailyMean = dailyAmounts.reduce((s, a) => s + a, 0) / dailyAmounts.length;
        const dailyStdDev = Math.sqrt(dailyAmounts.reduce((s, a) => s + Math.pow(a - dailyMean, 2), 0) / dailyAmounts.length);

        const todayStr = now.toISOString().slice(0, 10);
        const todayTotal = dailyTotals[todayStr] || 0;

        if (dailyStdDev > 0 && todayTotal > 0) {
            const zScore = (todayTotal - dailyMean) / dailyStdDev;
            if (zScore > 2) {
                alerts.push({
                    message: `Today's spending (₹${todayTotal.toLocaleString()}) is unusually high — ${(todayTotal / dailyMean).toFixed(1)}x your daily average.`,
                    type: 'negative',
                    severity: 'high',
                });
            } else if (zScore > 1.5) {
                alerts.push({
                    message: `Today's spending is above average at ₹${todayTotal.toLocaleString()} (avg: ₹${Math.round(dailyMean).toLocaleString()}).`,
                    type: 'warning',
                    severity: 'medium',
                });
            }
        }
    }

    // ─── 3. Category Surge Detection ───
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthByCategory = {};
    const lastMonthByCategory = {};

    recentExpenses.forEach(t => {
        const d = new Date(t.transactionDate);
        if (d >= thisMonth) {
            thisMonthByCategory[t.category] = (thisMonthByCategory[t.category] || 0) + t.amount;
        } else if (d >= lastMonth && d < thisMonth) {
            lastMonthByCategory[t.category] = (lastMonthByCategory[t.category] || 0) + t.amount;
        }
    });

    // Normalize by days elapsed
    const daysThisMonth = now.getDate();
    const daysLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();

    for (const [cat, amt] of Object.entries(thisMonthByCategory)) {
        const lastAmt = lastMonthByCategory[cat];
        if (!lastAmt || lastAmt < 100) continue; // Skip tiny amounts

        const normalizedThis = amt / daysThisMonth;
        const normalizedLast = lastAmt / daysLastMonth;
        const surge = ((normalizedThis - normalizedLast) / normalizedLast * 100).toFixed(0);

        if (surge > 50) {
            alerts.push({
                message: `"${cat}" spending surged ${surge}% compared to last month's pace.`,
                type: 'warning',
                severity: 'medium',
            });
        }
    }

    return alerts;
}

module.exports = { detectAnomalies };
