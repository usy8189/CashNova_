import { useState, useMemo } from 'react';
import { Plus, Target, Trash2, Edit2, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useGoalStore } from '@/store/goalStore';
import { useTransactionStore } from '@/store/transactionStore';
import GoalForm from '@/components/GoalForm';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, deleteGoal } = useGoalStore();
    const { getSummary } = useTransactionStore();
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    // Get current global savings to allocate towards goals
    // A more advanced app might allow explicit fund allocation per goal,
    // but here we can calculate a smart distribution or just show global capability.
    const summary = getSummary();
    const totalSavings = Math.max(0, summary.balance);

    // Distribute totalSavings across goals based on chronological priority or proportionally.
    // simpler: Assume goals.currentAmount is explicitly managed, but to auto-calculate insights:
    const avgMonthlySavings = summary.income > 0 ? (summary.income - summary.expense) : 0;

    const handleAdd = (data) => {
        const result = addGoal(data);
        if (result.success) {
            toast.success('Goal added');
            setShowForm(false);
        }
    };

    const handleEdit = (data) => {
        const result = updateGoal(editData.id, data);
        if (result.success) {
            toast.success('Goal updated');
            setShowForm(false);
            setEditData(null);
        }
    };

    const handleDelete = (id) => {
        deleteGoal(id);
        toast.success('Goal deleted');
    };

    // Helper to calculate goal metrics
    const calculateMetrics = (goal) => {
        const target = parseFloat(goal.targetAmount);
        const saved = goal.currentAmount || 0; // If explicit allocation is added later
        const remaining = Math.max(0, target - saved);
        const progress = Math.min(100, Math.max(0, (saved / target) * 100));

        const now = new Date();
        const end = new Date(goal.deadline);
        const monthsDiff = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
        const monthsLeft = Math.max(1, monthsDiff); // Avoid division by zero

        const reqMonthly = remaining / monthsLeft;

        let statusText = '';
        let statusType = 'neutral'; // 'good', 'warning', 'bad'

        if (saved >= target) {
            statusText = "Goal achieved! 🎉";
            statusType = "good";
        } else if (avgMonthlySavings >= reqMonthly) {
            statusText = `You are on track. Keep saving ${formatCurrency(reqMonthly)}/mo.`;
            statusType = "good";
        } else {
            statusText = `You need ${formatCurrency(reqMonthly)}/mo to reach this goal. (Avg savings: ${formatCurrency(avgMonthlySavings)})`;
            statusType = avgMonthlySavings > 0 ? "warning" : "bad";
        }

        return { progress, remaining, reqMonthly, monthsLeft, statusText, statusType };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Target size={24} className="text-emerald-400" />
                        Smart Goals
                    </h1>
                    <p className="text-sm text-white/40 mt-1">Track and predict your savings targets</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20">
                    <Plus size={16} /> New Goal
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Target size={24} className="text-white/20" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Goals Set</h3>
                    <p className="text-sm text-white/40 max-w-sm mx-auto">
                        Setting clear savings goals makes you 4x more likely to achieve them.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map((g) => {
                        const metrics = calculateMetrics(g);

                        return (
                            <div key={g.id} className="card p-6 flex flex-col group relative overflow-hidden transition-all hover:border-emerald-500/30">
                                {/* Delete/Edit overlay */}
                                <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                    <button onClick={() => { setEditData(g); setShowForm(true); }} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white/90 mb-1">{g.name}</h3>
                                    <p className="text-sm text-white/40">Deadline: {new Date(g.deadline).toLocaleDateString()}</p>
                                </div>

                                {/* Progress Math */}
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <span className="text-2xl font-bold text-white tracking-tight">{formatCurrency(g.currentAmount || 0)}</span>
                                        <span className="text-sm text-white/40 ml-2">/ {formatCurrency(g.targetAmount)}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-400">{metrics.progress.toFixed(0)}%</span>
                                </div>

                                {/* Progress Bar Styled like budgets */}
                                <div className="h-3 w-full bg-[#191919] rounded-full overflow-hidden shadow-inner mb-6 border border-white/[0.02]">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-500 to-teal-400 relative"
                                        style={{ width: `${metrics.progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                                    </div>
                                </div>

                                {/* AI Smart Insight */}
                                <div className={cn(
                                    "mt-auto p-4 rounded-xl flex items-start gap-3 border text-sm",
                                    metrics.statusType === 'good' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                                    metrics.statusType === 'warning' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                                    metrics.statusType === 'bad' && "bg-red-500/10 border-red-500/20 text-red-400"
                                )}>
                                    {metrics.statusType === 'good' ? <TrendingUp size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
                                    <p className="leading-relaxed">{metrics.statusText}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Forms */}
            {showForm && (
                <GoalForm
                    onSubmit={editData ? handleEdit : handleAdd}
                    onClose={() => { setShowForm(false); setEditData(null); }}
                    editingItem={editData}
                />
            )}
        </div>
    );
}
