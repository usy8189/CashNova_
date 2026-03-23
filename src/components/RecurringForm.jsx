import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export default function RecurringForm({ onSubmit, onClose, editingItem }) {
    const expenseCategories = CATEGORIES.filter(c => !['Salary', 'Freelance', 'Investment'].includes(c.name));
    const incomeCategories = CATEGORIES.filter(c => ['Salary', 'Freelance', 'Investment', 'Other'].includes(c.name));

    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: expenseCategories[0]?.name || CATEGORIES[0].name,
        title: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        autoAdd: true,
    });

    useEffect(() => {
        if (editingItem) {
            setFormData({
                ...editingItem,
            });
        }
    }, [editingItem]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'type' && {
                category: value === 'income' 
                    ? incomeCategories[0]?.name || CATEGORIES[0].name 
                    : expenseCategories[0]?.name || CATEGORIES[0].name,
            }),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: parseFloat(formData.amount),
        });
    };

    const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        {editingItem ? 'Edit Recurring' : 'New Recurring Entry'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="pl-8"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Title/Description</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Netflix Subscription"
                        />
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            {categories.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Recurring specifics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Frequency</label>
                            <select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="autoAdd" checked={formData.autoAdd} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            <span className="ml-3 text-sm font-medium text-white/70">Auto-add when due</span>
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all text-sm font-medium shadow-lg shadow-purple-500/25"
                        >
                            {editingItem ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
