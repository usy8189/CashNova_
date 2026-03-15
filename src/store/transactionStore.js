import { create } from 'zustand';
import { firestoreService } from '@/lib/firestore';
import { useAuthStore } from './authStore';

export const useTransactionStore = create((set, get) => ({
    transactions: [],
    loading: false,
    filter: { type: 'all', category: 'all', search: '' },
    sortBy: 'date',
    sortOrder: 'desc',
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },

    fetchTransactions: async () => {
        const { filter, sortBy, sortOrder } = get();
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        try {
            // Fetch all transactions for user (pagination handled client-side for now with Firebase)
            const result = await firestoreService.getByUserId('transactions', user.id, 'date', 'desc');
            if (result.success) {
                let transactions = result.data;

                // Client-side filtering
                if (filter.type !== 'all') {
                    transactions = transactions.filter(t => t.type === filter.type);
                }
                if (filter.category !== 'all') {
                    transactions = transactions.filter(t => t.category === filter.category);
                }
                if (filter.search) {
                    const s = filter.search.toLowerCase();
                    transactions = transactions.filter(t => 
                        t.description.toLowerCase().includes(s) || 
                        t.category.toLowerCase().includes(s)
                    );
                }

                // Client-side sorting
                transactions.sort((a, b) => {
                    let valA = a[sortBy];
                    let valB = b[sortBy];
                    if (sortBy === 'amount') {
                        valA = Number(valA);
                        valB = Number(valB);
                    }
                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });

                set({
                    transactions: transactions.map(t => ({
                        ...t,
                        date: t.date?.slice(0, 10), // normalize date format
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

    addTransaction: async (transaction) => {
        const user = useAuthStore.getState().user;
        if (!user) return { success: false, error: 'Not authenticated' };

        try {
            await firestoreService.create('transactions', {
                userId: user.id,
                amount: parseFloat(transaction.amount),
                type: transaction.type,
                category: transaction.category,
                description: transaction.description,
                date: transaction.date || new Date().toISOString(),
            });
            await get().fetchTransactions();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to add transaction' };
        }
    },

    updateTransaction: async (id, data) => {
        try {
            const updates = {};
            if (data.amount) updates.amount = parseFloat(data.amount);
            if (data.type) updates.type = data.type;
            if (data.category) updates.category = data.category;
            if (data.description) updates.description = data.description;
            if (data.date) updates.date = data.date;

            await firestoreService.update('transactions', id, updates);
            await get().fetchTransactions();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update' };
        }
    },

    deleteTransaction: async (id) => {
        try {
            await firestoreService.delete('transactions', id);
            await get().fetchTransactions();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to delete' };
        }
    },

    setFilter: (filter) => {
        set({ filter: { ...get().filter, ...filter }, pagination: { ...get().pagination, page: 1 } });
        get().fetchTransactions();
    },

    setSort: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
        get().fetchTransactions();
    },

    setPage: (page) => {
        set({ pagination: { ...get().pagination, page } });
        // Local pagination logic would go here, currently returning all for simplicity
        // in a real app you'd slice the get().transactions array.
    },

    // Computed helpers (client-side from loaded transactions)
    getFilteredTransactions: () => {
        return get().transactions;
    },

    getSummary: () => {
        const { transactions } = get();
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { income, expense, balance: income - expense };
    },

    getCategoryBreakdown: () => {
        const { transactions } = get();
        const map = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    },

    getMonthlyTrend: () => {
        const { transactions } = get();
        const map = {};
        transactions.forEach(t => {
            if(!t.date) return;
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            if (!map[month]) map[month] = { month, income: 0, expense: 0 };
            if (t.type === 'income') map[month].income += t.amount;
            else map[month].expense += t.amount;
        });
        return Object.values(map);
    },
}));
