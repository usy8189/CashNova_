import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function GoalForm({ onSubmit, onClose, editingItem }) {
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0], // Default 6 months
    });

    useEffect(() => {
        if (editingItem) {
            setFormData({
                ...editingItem,
            });
        }
    }, [editingItem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111111] border border-white/[0.06] rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {editingItem ? 'Edit Goal' : 'New Savings Goal'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Goal Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. New Car, Vacation"
                        />
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Target Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                            <input
                                type="number"
                                name="targetAmount"
                                required
                                min="1"
                                step="1"
                                value={formData.targetAmount}
                                onChange={handleChange}
                                className="pl-8"
                                placeholder="500000"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Target Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            required
                            value={formData.deadline}
                            onChange={handleChange}
                        />
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
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-sm font-medium shadow-lg shadow-emerald-500/25"
                        >
                            {editingItem ? 'Save Changes' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
