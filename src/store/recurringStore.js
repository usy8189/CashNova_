import { create } from 'zustand';
import { firestoreService } from '@/lib/firestore';
import { useAuthStore } from './authStore';
import { calculateNextDate } from '@/lib/utils'; // Assuming this utility can be anywhere or keep it here

export const calculateNextDateHelper = (currentDateStr, frequency) => {
    const date = new Date(currentDateStr);
    switch (frequency) {
        case 'daily': date.setDate(date.getDate() + 1); break;
        case 'weekly': date.setDate(date.getDate() + 7); break;
        case 'monthly': date.setMonth(date.getMonth() + 1); break;
        default: date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
};

export const useRecurringStore = create((set, get) => ({
    recurringItems: [],
    loading: false,

    fetchRecurring: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        try {
            const result = await firestoreService.getByUserId('recurring', user.id, 'createdAt', 'desc');
            if (result.success) {
                set({ recurringItems: result.data, loading: false });
            } else {
                set({ loading: false });
            }
        } catch {
            set({ loading: false });
        }
    },

    addRecurring: async (item) => {
        const user = useAuthStore.getState().user;
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
            await firestoreService.create('recurring', {
                userId: user.id,
                ...item,
                next_due_date: item.startDate || new Date().toISOString().split('T')[0],
                status: 'active'
            });
            await get().fetchRecurring();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to add recurring item' };
        }
    },

    updateRecurring: async (id, updates) => {
        try {
            await firestoreService.update('recurring', id, updates);
            await get().fetchRecurring();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update' };
        }
    },

    deleteRecurring: async (id) => {
        try {
            await firestoreService.delete('recurring', id);
            await get().fetchRecurring();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to delete' };
        }
    },

    toggleStatus: async (id) => {
        const item = get().recurringItems.find(i => i.id === id);
        if (!item) return;
        
        try {
            await firestoreService.update('recurring', id, {
                status: item.status === 'active' ? 'paused' : 'active'
            });
            await get().fetchRecurring();
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    },

    processDueTransactions: async (addTransactionFn) => {
        const { recurringItems, updateRecurring } = get();
        const todayStr = new Date().toISOString().split('T')[0];

        const dueItems = recurringItems.filter(item =>
            item.status === 'active' &&
            item.autoAdd &&
            item.next_due_date <= todayStr
        );

        if (dueItems.length === 0) return 0;
        let processedCount = 0;

        for (const item of dueItems) {
            const result = await addTransactionFn({
                amount: item.amount,
                type: item.type,
                category: item.category,
                description: `${item.title} [Auto Added]`,
                date: todayStr
            });

            if (result.success) {
                const newDueDate = calculateNextDateHelper(item.next_due_date, item.frequency);
                await updateRecurring(item.id, { next_due_date: newDueDate });
                processedCount++;
            }
        }
        return processedCount;
    }
}));

