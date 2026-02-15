import { create } from 'zustand';
import api from '@/lib/api';

export const useInsightStore = create((set, get) => ({
    insights: [],
    predictions: null,
    alerts: [],
    loading: false,
    error: null,

    fetchInsights: async () => {
        try {
            const { data } = await api.get('/insights');
            set({ insights: data });
        } catch (err) {
            console.error('Failed to fetch insights:', err);
        }
    },

    fetchPredictions: async () => {
        try {
            const { data } = await api.get('/insights/predictions');
            set({ predictions: data });
        } catch (err) {
            console.error('Failed to fetch predictions:', err);
        }
    },

    fetchAlerts: async () => {
        try {
            const { data } = await api.get('/insights/alerts');
            set({ alerts: data });
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        }
    },

    fetchAll: async () => {
        set({ loading: true });
        await Promise.all([
            get().fetchInsights(),
            get().fetchPredictions(),
            get().fetchAlerts(),
        ]);
        set({ loading: false });
    },
}));
