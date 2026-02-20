import { useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { formatCurrency } from '@/lib/utils';
import { SkeletonCard } from '@/components/SkeletonLoader';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#84cc16', '#14b8a6'];

export default function AnalyticsPage() {
    const { transactions, loading, fetchTransactions, getCategoryBreakdown, getMonthlyTrend, getSummary } = useTransactionStore();

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const breakdown = getCategoryBreakdown();
    const trend = getMonthlyTrend();
    const summary = getSummary();

    if (loading && transactions.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonCard /><SkeletonCard />
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            <div>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-sm text-white/40 mt-1">Spending patterns and trends</p>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card text-center">
                    <p className="text-xs text-white/40 mb-1">Total Income</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(summary.income)}</p>
                </div>
                <div className="card text-center">
                    <p className="text-xs text-white/40 mb-1">Total Expenses</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(summary.expense)}</p>
                </div>
                <div className="card text-center">
                    <p className="text-xs text-white/40 mb-1">Net Savings</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(summary.balance)}</p>
                </div>
                <div className="card text-center">
                    <p className="text-xs text-white/40 mb-1">Categories</p>
                    <p className="text-lg font-bold text-white">{breakdown.length}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="card">
                    <h2 className="text-sm font-medium text-white/40 mb-6">Spending by Category</h2>
                    {breakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {breakdown.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#191919', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', color: '#fff', fontSize: 13 }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-white/20 text-sm py-16">No expense data</p>
                    )}
                </div>

                {/* Monthly Trend */}
                <div className="card">
                    <h2 className="text-sm font-medium text-white/40 mb-6">Monthly Trend</h2>
                    {trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={trend} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <Tooltip
                                    contentStyle={{ background: '#191919', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', color: '#fff', fontSize: 13 }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-white/20 text-sm py-16">No data yet</p>
                    )}
                </div>
            </div>

            {/* Category Table */}
            {breakdown.length > 0 && (
                <div className="card">
                    <h2 className="text-sm font-medium text-white/40 mb-4">Category Details</h2>
                    <div className="space-y-3">
                        {breakdown.map((cat, i) => (
                            <div key={cat.name} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                                    />
                                    <span className="text-sm text-white/80">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-white/60 tabular-nums">
                                        {formatCurrency(cat.value)}
                                    </span>
                                    <span className="text-xs text-white/30 w-12 text-right tabular-nums">
                                        {summary.expense > 0 ? ((cat.value / summary.expense) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
