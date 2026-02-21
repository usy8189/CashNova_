import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGoalStore = create(
    persist(
        (set, get) => ({
            goals: [],

            addGoal: (goal) => {
                const newGoal = {
                    ...goal,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    targetAmount: parseFloat(goal.targetAmount),
                    currentAmount: 0 // New goals start at 0 explicitly saved towards them (or we calculate globally)
                };

                set((state) => ({
                    goals: [...state.goals, newGoal]
                }));
                return { success: true };
            },

            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === id ? { ...g, ...updates } : g
                    )
                }));
                return { success: true };
            },

            deleteGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter((g) => g.id !== id)
                }));
            },

            addFunds: (id, amount) => {
                set((state) => ({
                    goals: state.goals.map((g) =>
                        g.id === id
                            ? { ...g, currentAmount: (g.currentAmount || 0) + parseFloat(amount) }
                            : g
                    )
                }));
                return { success: true };
            }
        }),
        {
            name: 'cashnova-goals-storage',
        }
    )
);
