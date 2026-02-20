import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useBudgetStore } from '@/store/budgetStore';
import { CATEGORIES, MONTHS } from '@/lib/constants';
import BudgetProgressBar from '@/components/BudgetProgressBar';
import { SkeletonCard } from '@/components/SkeletonLoader';
import toast from 'react-hot-toast';

function getCurrentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetsPage() {
    const { budgets, loading, fetchBudgets, addBudget, deleteBudget } = useBudgetStore();
    const [month, setMonth] = useState(getCurrentMonth());
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ category: CATEGORIES[0].name, limit: '', month: getCurrentMonth() });

    useEffect(() => { fetchBudgets(month); }, [fetchBudgets, month]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.limit) return;
        const result = await addBudget(form);
        if (result.success) { toast.success('Budget added'); setShowForm(false); setForm({ category: CATEGORIES[0].name, limit: '', month }); }
        else toast.error(result.error);
    };

    const handleDelete = async (id) => {
        const result = await deleteBudget(id);
        result.success ? toast.success('Deleted') : toast.error(result.error);
    };

    const year = parseInt(month.split('-')[0]);
    const monthIndex = parseInt(month.split('-')[1]) - 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Budgets</h1>
                    <p className="text-sm text-white/40 mt-1">{MONTHS[monthIndex]} {year}</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-auto text-sm"
                    />
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        <Plus size={16} /> Add Budget
                    </button>
                </div>
            </div>

            {/* Budget List */}
            {loading && budgets.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
            ) : budgets.length === 0 ? (
                <div className="card text-center py-16">
                    <p className="text-white/30 text-sm">No budgets for this month</p>
                    <button onClick={() => setShowForm(true)} className="btn btn-ghost mt-4 text-sm">
                        <Plus size={14} /> Create one
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {budgets.map((b) => (
                        <div key={b.id} className="relative group">
                            <BudgetProgressBar
                                category={b.category}
                                spent={b.spent}
                                limit={b.limit}
                                percentage={b.percentage}
                            />
                            <button
                                onClick={() => handleDelete(b.id)}
                                className="absolute top-3 right-3 p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="card w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">New Budget</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm text-white/40 font-medium">Category</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                    {CATEGORIES.filter(c => !['Salary', 'Freelance', 'Investment'].includes(c.name)).map((c) => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-white/40 font-medium">Monthly Limit</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    required
                                    value={form.limit}
                                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                                    placeholder="5000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-white/40 font-medium">Month</label>
                                <input
                                    type="month"
                                    value={form.month}
                                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost flex-1">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Create Budget</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
