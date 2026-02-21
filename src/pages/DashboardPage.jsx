import { useEffect, useState, useCallback } from 'react';
import { Plus, Brain, Download } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthStore } from '@/store/authStore';
import { useInsightStore } from '@/store/insightStore';
import { getGreeting, formatCurrency } from '@/lib/utils';
import { exportDashboardToPDF } from '@/lib/exportUtils';
import BalanceHero from '@/components/BalanceHero';
import DailyBudgetTracker from '@/components/DailyBudgetTracker';
import StreakBadge from '@/components/StreakBadge';
import MilestoneCard from '@/components/MilestoneCard';
import QuickActions from '@/components/QuickActions';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import InsightCard from '@/components/InsightCard';
import AlertBanner from '@/components/AlertBanner';
import PredictionCard from '@/components/PredictionCard';
import { SkeletonCard, SkeletonRow } from '@/components/SkeletonLoader';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ── Confetti burst helper ──
function spawnConfetti() {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 20; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-particle';
        el.style.left = `${Math.random() * 60 + 20}%`;
        el.style.top = `${Math.random() * 20 + 30}%`;
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDelay = `${Math.random() * 0.3}s`;
        el.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2000);
    }
}

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { transactions, loading, fetchTransactions, addTransaction, getSummary, getMonthlyTrend } = useTransactionStore();
    const { insights, predictions, alerts, fetchAll: fetchIntelligence } = useInsightStore();
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchIntelligence();
    }, [fetchTransactions, fetchIntelligence]);

    const summary = getSummary();
    const trend = getMonthlyTrend();
    const recentTransactions = transactions.slice(0, 6);

    // Calculate today's spending
    const today = new Date().toISOString().slice(0, 10);
    const todayExpense = transactions
        .filter(t => t.type === 'expense' && (t.date || '').startsWith(today))
        .reduce((s, t) => s + t.amount, 0);

    // Estimate daily budget from monthly budgets (or fallback)
    const monthlyBudgetTotal = predictions?.budgetAlerts?.reduce((s, b) => s + b.limit, 0) || 0;
    const dailyLimit = monthlyBudgetTotal > 0
        ? Math.round(monthlyBudgetTotal / 30)
        : summary.income > 0
            ? Math.round((summary.income * 0.7) / 30) // 70% of income as spending budget
            : 0;

    const handleAdd = async (data) => {
        const result = await addTransaction(data);
        if (result.success) {
            // Enhanced toast with amount
            const amount = parseFloat(data.amount);
            const isIncome = data.type === 'income';
            toast.success(
                `${isIncome ? '+' : '-'}${formatCurrency(amount)} ${isIncome ? 'earned' : 'spent'}!`,
                {
                    icon: isIncome ? '💰' : '💸',
                    style: { background: '#191919', color: '#fff', border: '1px solid rgba(255,255,255,0.06)' },
                }
            );
            // Confetti for income or large amounts
            if (isIncome || amount >= 1000) {
                spawnConfetti();
            }
            fetchIntelligence();
        } else {
            toast.error(result.error);
        }
    };

    const isLoading = loading && transactions.length === 0;

    return (
        <div id="dashboard-export-area" style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {/* Alert Banner — top priority */}
            {alerts.length > 0 && <AlertBanner alerts={alerts} />}

            {/* Greeting */}
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                    </h1>
                    <p className="text-sm text-white/40 mt-2">Here's your financial overview</p>
                </div>
                <button
                    onClick={() => exportDashboardToPDF('dashboard-export-area')}
                    className="btn btn-ghost text-sm"
                >
                    <Download size={16} /> Export Report
                </button>
            </div>

            {/* ── SECTION 1: Balance Hero ── */}
            {isLoading ? (
                <SkeletonCard />
            ) : (
                <BalanceHero
                    income={summary.income}
                    expense={summary.expense}
                    balance={summary.balance}
                    todayExpense={todayExpense}
                />
            )}

            {/* ── SECTION 2: Quick Actions + Daily Budget + Streak ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                <QuickActions onAddTransaction={() => setShowForm(true)} />
                <DailyBudgetTracker spentToday={todayExpense} dailyLimit={dailyLimit} />
                <StreakBadge transactions={transactions} />
            </div>

            {/* ── SECTION 3: Chart + Predictions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Chart — 2/3 */}
                <div className="lg:col-span-2 card p-10">
                    <h2 className="text-sm font-medium text-white/40 mb-10">Monthly Overview</h2>
                    {trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={340}>
                            <BarChart data={trend} barGap={6}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <Tooltip
                                    contentStyle={{ background: '#191919', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', color: '#fff', fontSize: 13 }}
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-white/20 text-sm py-20">No data yet</p>
                    )}
                </div>

                {/* Prediction Card — 1/3 */}
                <div className="lg:col-span-1 space-y-8">
                    <PredictionCard predictions={predictions} />
                    <MilestoneCard
                        transactionCount={transactions.length}
                        totalSavings={Math.max(0, summary.balance)}
                    />
                </div>
            </div>

            {/* ── SECTION 4: AI Insights ── */}
            {insights.length > 0 && (
                <div className="animate-slide-up">
                    <div className="flex items-center gap-2 mb-5">
                        <Brain size={18} className="text-purple-400" />
                        <h2 className="text-sm font-medium text-white/40">AI Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.map((insight, i) => (
                            <InsightCard key={i} message={insight.message} type={insight.type} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECTION 5: Recent Transactions ── */}
            <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-medium text-white/40">Recent Transactions</h2>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary text-xs py-2 px-3">
                        <Plus size={14} /> Add
                    </button>
                </div>
                {isLoading ? (
                    <div className="space-y-2">
                        <SkeletonRow /><SkeletonRow /><SkeletonRow />
                    </div>
                ) : (
                    <TransactionList transactions={recentTransactions} showActions={false} />
                )}
            </div>

            {showForm && <TransactionForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
        </div>
    );
}
