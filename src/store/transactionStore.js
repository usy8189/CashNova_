import { create } from 'zustand';
import api from '@/lib/api';

export const useTransactionStore = create((set, get) => ({
    transactions: [],
    loading: false,
    filter: { type: 'all', category: 'all', search: '' },
    sortBy: 'date',
    sortOrder: 'desc',
    pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },

    fetchTransactions: async () => {
        const { filter, sortBy, sortOrder, pagination } = get();
        set({ loading: true });
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                sort: sortBy,
                order: sortOrder,
            };
            if (filter.type !== 'all') params.type = filter.type;
            if (filter.category !== 'all') params.category = filter.category;
            if (filter.search) params.search = filter.search;

            const { data } = await api.get('/transactions', { params });
            set({
                transactions: data.transactions.map(t => ({
                    ...t,
                    date: t.transactionDate?.slice(0, 10) || t.date,
                })),
                pagination: data.pagination,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    addTransaction: async (transaction) => {
        try {
            await api.post('/transactions', {
                amount: parseFloat(transaction.amount),
                type: transaction.type,
                category: transaction.category,
                description: transaction.description,
                date: transaction.date,
            });
            await get().fetchTransactions();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to add transaction' };
        }
    },

    updateTransaction: async (id, data) => {
        try {
            await api.patch(`/transactions/${id}`, {
                ...(data.amount && { amount: parseFloat(data.amount) }),
                ...(data.type && { type: data.type }),
                ...(data.category && { category: data.category }),
                ...(data.description && { description: data.description }),
                ...(data.date && { date: data.date }),
            });
            await get().fetchTransactions();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to update' };
        }
    },

    deleteTransaction: async (id) => {
        try {
            await api.delete(`/transactions/${id}`);
            await get().fetchTransactions();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Failed to delete' };
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
        get().fetchTransactions();
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
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            if (!map[month]) map[month] = { month, income: 0, expense: 0 };
            if (t.type === 'income') map[month].income += t.amount;
            else map[month].expense += t.amount;
        });
        return Object.values(map);
    },
}));
