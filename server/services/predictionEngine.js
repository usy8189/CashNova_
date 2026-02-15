const prisma = require('../utils/prisma');

/**
 * Generates spending predictions and forecasts.
 */
async function generatePredictions(userId) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const remainingDays = daysInMonth - dayOfMonth;

    const [allExpenses, budgets, allIncomes] = await Promise.all([
        prisma.transaction.findMany({
            where: { userId, type: 'expense' },
            orderBy: { transactionDate: 'desc' },
        }),
        prisma.budget.findMany({
            where: { userId, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
        }),
        prisma.transaction.findMany({
            where: { userId, type: 'income' },
            orderBy: { transactionDate: 'desc' },
        }),
    ]);

    const thisMonthExpenses = allExpenses.filter(t => new Date(t.transactionDate) >= thisMonth);
    const thisMonthIncome = allIncomes
        .filter(t => new Date(t.transactionDate) >= thisMonth)
        .reduce((s, t) => s + t.amount, 0);

    // ─── 1. Monthly Spending Projection ───
    const spentSoFar = thisMonthExpenses.reduce((s, t) => s + t.amount, 0);
    const dailyAvg = dayOfMonth > 0 ? spentSoFar / dayOfMonth : 0;
    const projectedTotal = Math.round(spentSoFar + dailyAvg * remainingDays);

    // ─── 2. Category Forecast ───
    const categorySpent = {};
    thisMonthExpenses.forEach(t => {
        categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
    });

    const categoryForecast = Object.entries(categorySpent)
        .map(([category, spent]) => {
            const projected = Math.round(spent + (spent / dayOfMonth) * remainingDays);
            return { category, spent, projected };
        })
        .sort((a, b) => b.projected - a.projected);

    // ─── 3. Savings Estimate ───
    // Use historical income average if this month's income is 0
    const monthlyIncomes = {};
    allIncomes.forEach(t => {
        const m = new Date(t.transactionDate).toISOString().slice(0, 7);
        monthlyIncomes[m] = (monthlyIncomes[m] || 0) + t.amount;
    });
    const incomeValues = Object.values(monthlyIncomes);
    const avgIncome = incomeValues.length > 0
        ? incomeValues.reduce((s, v) => s + v, 0) / incomeValues.length
        : 0;
    const estimatedIncome = thisMonthIncome > 0 ? thisMonthIncome : avgIncome;
    const projectedSavings = Math.round(estimatedIncome - projectedTotal);

    // ─── 4. Budget Overflow ETA ───
    const budgetAlerts = budgets.map(b => {
        const spent = thisMonthExpenses
            .filter(t => t.category === b.categoryName)
            .reduce((s, t) => s + t.amount, 0);
        const remaining = b.monthlyLimit - spent;
        const catDailyAvg = dayOfMonth > 0 ? spent / dayOfMonth : 0;
        const daysUntilOverflow = catDailyAvg > 0 ? Math.ceil(remaining / catDailyAvg) : null;
        const pct = (spent / b.monthlyLimit) * 100;

        return {
            category: b.categoryName,
            limit: b.monthlyLimit,
            spent,
            remaining: Math.max(0, remaining),
            percentage: Math.round(pct),
            dailyAvg: Math.round(catDailyAvg),
            daysUntilOverflow: remaining > 0 ? daysUntilOverflow : 0,
            status: pct > 100 ? 'exceeded' : pct > 80 ? 'warning' : 'safe',
        };
    }).sort((a, b) => b.percentage - a.percentage);

    // ─── 5. Moving Average (3-month weighted) ───
    const monthlyExpenses = {};
    allExpenses.forEach(t => {
        const m = new Date(t.transactionDate).toISOString().slice(0, 7);
        monthlyExpenses[m] = (monthlyExpenses[m] || 0) + t.amount;
    });
    const months = Object.keys(monthlyExpenses).sort();
    const amounts = months.map(m => monthlyExpenses[m]);

    let movingAvgForecast = projectedTotal;
    if (amounts.length >= 3) {
        // Weighted: recent months count more
        const last3 = amounts.slice(-3);
        movingAvgForecast = Math.round(last3[0] * 0.2 + last3[1] * 0.3 + last3[2] * 0.5);
    } else if (amounts.length >= 2) {
        const last2 = amounts.slice(-2);
        movingAvgForecast = Math.round(last2[0] * 0.4 + last2[1] * 0.6);
    }

    return {
        monthlyProjection: {
            spentSoFar,
            dailyAvg: Math.round(dailyAvg),
            projectedTotal,
            remainingDays,
            dayOfMonth,
            daysInMonth,
        },
        categoryForecast,
        savingsEstimate: {
            estimatedIncome: Math.round(estimatedIncome),
            projectedExpenses: projectedTotal,
            projectedSavings,
            savingsRate: estimatedIncome > 0 ? Math.round((projectedSavings / estimatedIncome) * 100) : 0,
        },
        budgetAlerts,
        movingAvgForecast,
        confidence: amounts.length >= 3 ? 'high' : amounts.length >= 2 ? 'medium' : 'low',
    };
}

module.exports = { generatePredictions };
