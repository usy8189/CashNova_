import { create } from 'zustand';
import api from '@/lib/api';

export const useBudgetStore = create((set, get) => ({
    budgets: [],
    loading: false,

    fetchBudgets: async (month) => {
        set({ loading: true });
        try {
            const params = month ? { month } : {};
            const { data } = await api.get('/budgets', { params });
            set({
                budgets: data.map(b => ({
                    id: b.id,
                    category: b.categoryName,
                    limit: b.monthlyLimit,
                    month: b.month,
                    spent: b.spent || 0,
                    remaining: b.remaining || 0,
                    percentage: b.percentage || 0,
                })),
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    addBudget: async (budget) => {
        try {
            await api.post('/budgets', {
                categoryName: budget.category,
                monthlyLimit: parseFloat(budget.limit),
                month: budget.month,
            });
            await get().fetchBudgets();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to add budget' };
        }
    },

    updateBudget: async (id, data) => {
        try {
            await api.patch(`/budgets/${id}`, {
                ...(data.category && { categoryName: data.category }),
                ...(data.limit && { monthlyLimit: parseFloat(data.limit) }),
                ...(data.month && { month: data.month }),
            });
            await get().fetchBudgets();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to update budget' };
        }
    },

    deleteBudget: async (id) => {
        try {
            await api.delete(`/budgets/${id}`);
            await get().fetchBudgets();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to delete budget' };
        }
    },
}));
