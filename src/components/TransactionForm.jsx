import { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES, TRANSACTION_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function TransactionForm({ onSubmit, onClose, initialData = null }) {
    const [form, setForm] = useState({
        type: initialData?.type || TRANSACTION_TYPES.EXPENSE,
        amount: initialData?.amount || '',
        category: initialData?.category || CATEGORIES[0].name,
        description: initialData?.description || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
    });

    const isIncome = form.type === 'income';

    const filteredCategories = CATEGORIES.filter((c) =>
        isIncome
            ? ['Salary', 'Freelance', 'Investment', 'Other'].includes(c.name)
            : !['Salary', 'Freelance', 'Investment'].includes(c.name)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.amount || !form.description) return;
        onSubmit({ ...form, amount: parseFloat(form.amount) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="card w-full max-w-lg p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">
                        {initialData ? 'Edit' : 'Add'} Transaction
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03]">
                        {['expense', 'income'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    const cats = CATEGORIES.filter((c) =>
                                        type === 'income'
                                            ? ['Salary', 'Freelance', 'Investment', 'Other'].includes(c.name)
                                            : !['Salary', 'Freelance', 'Investment'].includes(c.name)
                                    );
                                    setForm({ ...form, type, category: cats[0]?.name || CATEGORIES[0].name });
                                }}
                                className={cn(
                                    'py-2.5 rounded-lg text-sm font-medium transition-all',
                                    form.type === type
                                        ? type === 'income'
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'bg-red-500/15 text-red-400'
                                        : 'text-white/30 hover:text-white/50'
                                )}
                            >
                                {type === 'income' ? 'Income' : 'Expense'}
                            </button>
                        ))}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 font-medium">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm text-white/40 font-medium">Description</label>
                        <input
                            type="text"
                            required
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="What was this for?"
                        />
                    </div>

                    {/* Category & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-white/40 font-medium">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                {filteredCategories.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-white/40 font-medium">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {initialData ? 'Save Changes' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
