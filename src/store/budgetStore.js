import { create } from 'zustand';
import { firestoreService } from '@/lib/firestore';
import { useAuthStore } from './authStore';

export const useBudgetStore = create((set, get) => ({
    budgets: [],
    loading: false,

    fetchBudgets: async (month) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        try {
            const result = await firestoreService.getByUserId('budgets', user.id, 'createdAt', 'desc');
            if (result.success) {
                let budgets = result.data;
                if (month) {
                    budgets = budgets.filter(b => b.month === month);
                }
                
                set({
                    budgets: budgets.map(b => ({
                        id: b.id,
                        category: b.categoryName,
                        limit: b.monthlyLimit,
                        month: b.month,
                        spent: b.spent || 0, // In a real app, spent would be calculated dynamically by querying transactions
                        remaining: (b.monthlyLimit - (b.spent || 0)) || Number(b.monthlyLimit),
                        percentage: b.spent ? (b.spent / b.monthlyLimit) * 100 : 0,
                    })),
                    loading: false,
                });
            } else {
                 set({ loading: false });
            }
        } catch {
            set({ loading: false });
        }
    },

    addBudget: async (budget) => {
        const user = useAuthStore.getState().user;
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
            await firestoreService.create('budgets', {
                userId: user.id,
                categoryName: budget.category,
                monthlyLimit: parseFloat(budget.limit),
                month: budget.month,
            });
            await get().fetchBudgets(budget.month);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to add budget' };
        }
    },

    updateBudget: async (id, data) => {
        try {
            const updates = {};
            if (data.category) updates.categoryName = data.category;
            if (data.limit) updates.monthlyLimit = parseFloat(data.limit);
            if (data.month) updates.month = data.month;

            await firestoreService.update('budgets', id, updates);
            await get().fetchBudgets(); // fetch all or could pass current month if stored in state
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update budget' };
        }
    },

    deleteBudget: async (id) => {
        try {
            await firestoreService.delete('budgets', id);
            await get().fetchBudgets();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to delete budget' };
        }
    },
}));
