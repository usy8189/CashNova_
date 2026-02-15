import { create } from 'zustand';
import api from '@/lib/api';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            set({ loading: false });
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    },

    register: async (name, email, password) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (err) {
            set({ loading: false });
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    },

    updateUser: async (updates) => {
        try {
            const { data } = await api.patch('/users/profile', updates);
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'Update failed' };
        }
    },

    fetchProfile: async () => {
        try {
            const { data } = await api.get('/users/profile');
            localStorage.setItem('user', JSON.stringify(data));
            set({ user: data });
        } catch {
            // silently fail
        }
    },

    logout: () => {
        api.post('/auth/logout').catch(() => { });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));
