import { create } from 'zustand';
import { firestoreService } from '@/lib/firestore';
import { useAuthStore } from './authStore';

export const useGoalStore = create((set, get) => ({
    goals: [],
    loading: false,

    fetchGoals: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        try {
            const result = await firestoreService.getByUserId('goals', user.id, 'createdAt', 'desc');
            if (result.success) {
                set({ goals: result.data, loading: false });
            } else {
                set({ loading: false });
            }
        } catch {
            set({ loading: false });
        }
    },

    addGoal: async (goal) => {
        const user = useAuthStore.getState().user;
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
            await firestoreService.create('goals', {
                userId: user.id,
                ...goal,
                targetAmount: parseFloat(goal.targetAmount),
                currentAmount: 0
            });
            await get().fetchGoals();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to add goal' };
        }
    },

    updateGoal: async (id, updates) => {
        try {
            await firestoreService.update('goals', id, updates);
            await get().fetchGoals();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update goal' };
        }
    },

    deleteGoal: async (id) => {
        try {
            await firestoreService.delete('goals', id);
            await get().fetchGoals();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to delete goal' };
        }
    },

    addFunds: async (id, amount) => {
        try {
            const goal = get().goals.find(g => g.id === id);
            if (!goal) return { success: false, error: 'Goal not found' };
            
            await firestoreService.update('goals', id, {
                currentAmount: (goal.currentAmount || 0) + parseFloat(amount)
            });
            await get().fetchGoals();
            return { success: true };
        } catch (err) {
             return { success: false, error: err.message || 'Failed to add funds' };
        }
    }
}));

