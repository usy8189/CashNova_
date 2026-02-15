const prisma = require('../utils/prisma');

/**
 * Generates smart insights by analyzing transaction data.
 * Returns an array of { message, type } objects.
 */
async function generateInsights(userId) {
    const [transactions, budgets] = await Promise.all([
        prisma.transaction.findMany({
            where: { userId },
            orderBy: { transactionDate: 'desc' },
        }),
        prisma.budget.findMany({ where: { userId } }),
    ]);

    if (transactions.length === 0) {
        return [{ message: 'Start adding transactions to get personalized insights.', type: 'info' }];
    }

    const insights = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    const incomes = transactions.filter(t => t.type === 'income');
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

    // ─── 1. Savings Rate ───
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
    if (savingsRate > 30) {
        insights.push({ message: `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income.`, type: 'positive' });
    } else if (savingsRate > 10) {
        insights.push({ message: `You're saving ${savingsRate.toFixed(1)}% of your income. Target 30% for financial health.`, type: 'info' });
    } else if (savingsRate > 0) {
        insights.push({ message: `Low savings rate: ${savingsRate.toFixed(1)}%. Consider reducing non-essential spending.`, type: 'warning' });
    } else if (totalIncome > 0) {
        insights.push({ message: `You're spending more than you earn! Review your expenses immediately.`, type: 'negative' });
    }

    // ─── 2. Weekly Comparison ───
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 86400000);
    const twoWeeksAgo = new Date(now - 14 * 86400000);

    const thisWeekExpenses = expenses.filter(t => new Date(t.transactionDate) >= oneWeekAgo);
    const lastWeekExpenses = expenses.filter(t => {
        const d = new Date(t.transactionDate);
        return d >= twoWeeksAgo && d < oneWeekAgo;
    });

    const thisWeekTotal = thisWeekExpenses.reduce((s, t) => s + t.amount, 0);
    const lastWeekTotal = lastWeekExpenses.reduce((s, t) => s + t.amount, 0);

    if (lastWeekTotal > 0) {
        const change = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(0);
        if (change > 20) {
            insights.push({ message: `You spent ${change}% more this week compared to last week.`, type: 'warning' });
        } else if (change < -10) {
            insights.push({ message: `Great job! Spending is down ${Math.abs(change)}% compared to last week.`, type: 'positive' });
        } else {
            insights.push({ message: `Spending this week is similar to last week (${change > 0 ? '+' : ''}${change}%).`, type: 'info' });
        }
    }

    // ─── 3. Category Distribution ───
    const categoryMap = {};
    expenses.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length > 0) {
        const [topCat, topAmt] = sortedCategories[0];
        const pct = ((topAmt / totalExpense) * 100).toFixed(0);
        insights.push({
            message: `Your highest expense category is "${topCat}" at ${pct}% of total spending (₹${topAmt.toLocaleString()}).`,
            type: 'info',
        });
    }

    // ─── 4. Weekend vs Weekday ───
    const weekdayExpenses = expenses.filter(t => {
        const day = new Date(t.transactionDate).getDay();
        return day >= 1 && day <= 5;
    });
    const weekendExpenses = expenses.filter(t => {
        const day = new Date(t.transactionDate).getDay();
        return day === 0 || day === 6;
    });

    const avgWeekday = weekdayExpenses.length > 0
        ? weekdayExpenses.reduce((s, t) => s + t.amount, 0) / weekdayExpenses.length
        : 0;
    const avgWeekend = weekendExpenses.length > 0
        ? weekendExpenses.reduce((s, t) => s + t.amount, 0) / weekendExpenses.length
        : 0;

    if (avgWeekday > 0 && avgWeekend > 0) {
        const ratio = (avgWeekend / avgWeekday).toFixed(1);
        if (ratio > 1.5) {
            insights.push({ message: `Weekend spending is ${ratio}x higher than weekdays on average.`, type: 'warning' });
        } else if (ratio < 0.7) {
            insights.push({ message: `You spend more on weekdays than weekends. Consider if those are necessary expenses.`, type: 'info' });
        }
    }

    // ─── 5. Monthly Trend Detection ───
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthExpenses = expenses.filter(t => new Date(t.transactionDate) >= thisMonth);
    const lastMonthExpenses = expenses.filter(t => {
        const d = new Date(t.transactionDate);
        return d >= lastMonth && d < thisMonth;
    });

    const thisMonthTotal = thisMonthExpenses.reduce((s, t) => s + t.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((s, t) => s + t.amount, 0);

    if (lastMonthTotal > 0) {
        // Compare category shifts
        const lastCategoryMap = {};
        lastMonthExpenses.forEach(t => {
            lastCategoryMap[t.category] = (lastCategoryMap[t.category] || 0) + t.amount;
        });
        const thisCategoryMap = {};
        thisMonthExpenses.forEach(t => {
            thisCategoryMap[t.category] = (thisCategoryMap[t.category] || 0) + t.amount;
        });

        for (const [cat, amt] of Object.entries(thisCategoryMap)) {
            const prev = lastCategoryMap[cat] || 0;
            if (prev > 0) {
                const change = ((amt - prev) / prev * 100).toFixed(0);
                if (change > 40) {
                    insights.push({ message: `"${cat}" expenses jumped ${change}% compared to last month.`, type: 'warning' });
                } else if (change < -30) {
                    insights.push({ message: `"${cat}" expenses dropped ${Math.abs(change)}% vs last month. Good trend!`, type: 'positive' });
                }
            }
        }
    }

    // ─── 6. Savings Opportunities ───
    if (sortedCategories.length >= 2 && totalExpense > 0) {
        const [topCat, topAmt] = sortedCategories[0];
        const potentialSaving = Math.round(topAmt * 0.2);
        if (potentialSaving > 100) {
            insights.push({
                message: `Reducing "${topCat}" by 20% could save you ₹${potentialSaving.toLocaleString()} per period.`,
                type: 'info',
            });
        }
    }

    // ─── 7. Budget Alerts ───
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentBudgets = budgets.filter(b => b.month === currentMonth);

    currentBudgets.forEach(b => {
        const spent = thisMonthExpenses
            .filter(t => t.category === b.categoryName)
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

    return insights;
}

module.exports = { generateInsights };
