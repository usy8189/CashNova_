import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthStore } from '@/store/authStore';
import { getGreeting, formatCurrency } from '@/lib/utils';
import StatCard from '@/components/StatCard';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { SkeletonCard, SkeletonRow } from '@/components/SkeletonLoader';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { transactions, loading, fetchTransactions, addTransaction, getSummary, getMonthlyTrend } = useTransactionStore();
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const summary = getSummary();
    const trend = getMonthlyTrend();
    const recentTransactions = transactions.slice(0, 8);

    const handleAdd = async (data) => {
        const result = await addTransaction(data);
        if (result.success) toast.success('Transaction added');
        else toast.error(result.error);
    };

    return (
        <div className="space-y-12">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-sm text-white/40 mt-2">Here's your financial overview</p>
            </div>

            {/* Stats */}
            {loading && transactions.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" style={{ marginBottom: '48px' }}>
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" style={{ marginBottom: '48px' }}>
                    <StatCard label="Income" value={summary.income} icon={TrendingUp} type="income" />
                    <StatCard label="Expenses" value={summary.expense} icon={TrendingDown} type="expense" />
                    <StatCard label="Balance" value={summary.balance} icon={DollarSign} type={summary.balance >= 0 ? 'income' : 'expense'} />
                </div>
            )}

            {/* Chart + Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart — takes 2/3 */}
                <div className="lg:col-span-2 card p-8">
                    <h2 className="text-sm font-medium text-white/40 mb-8">Monthly Overview</h2>
                    {trend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={380}>
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

                {/* Recent Transactions — takes 1/3 */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-white/40">Recent Transactions</h2>
                        <button onClick={() => setShowForm(true)} className="btn btn-primary text-xs py-2 px-3">
                            <Plus size={14} /> Add
                        </button>
                    </div>
                    {loading && transactions.length === 0 ? (
                        <div className="space-y-2">
                            <SkeletonRow /><SkeletonRow /><SkeletonRow />
                        </div>
                    ) : (
                        <TransactionList transactions={recentTransactions} showActions={false} />
                    )}
                </div>
            </div>

            {showForm && <TransactionForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
        </div>
    );
}
