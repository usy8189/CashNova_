import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTransactionStore } from './transactionStore';

// Helper to calculate the next date based on frequency
export const calculateNextDate = (currentDateStr, frequency) => {
    const date = new Date(currentDateStr);

    switch (frequency) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        // fallback
        default:
            date.setMonth(date.getMonth() + 1);
    }

    // Return simply YYYY-MM-DD
    return date.toISOString().split('T')[0];
};

export const useRecurringStore = create(
    persist(
        (set, get) => ({
            recurringItems: [],

            addRecurring: (item) => {
                const newItem = {
                    ...item,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    next_due_date: item.startDate || new Date().toISOString().split('T')[0],
                    status: 'active' // active, paused
                };

                set((state) => ({
                    recurringItems: [...state.recurringItems, newItem]
                }));
                return { success: true };
            },

            updateRecurring: (id, updates) => {
                set((state) => ({
                    recurringItems: state.recurringItems.map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    )
                }));
                return { success: true };
            },

            deleteRecurring: (id) => {
                set((state) => ({
                    recurringItems: state.recurringItems.filter((item) => item.id !== id)
                }));
            },

            toggleStatus: (id) => {
                set((state) => ({
                    recurringItems: state.recurringItems.map((item) =>
                        item.id === id
                            ? { ...item, status: item.status === 'active' ? 'paused' : 'active' }
                            : item
                    )
                }));
            },

            // Check and process due recurring transactions
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
                    // 1. Create the transaction
                    const result = await addTransactionFn({
                        amount: item.amount,
                        type: item.type,
                        category: item.category,
                        description: `${item.title} [Auto Added]`,
                        date: todayStr // the day it was processed
                    });

                    // 2. If successful, update the next due date
                    if (result.success) {
                        const newDueDate = calculateNextDate(item.next_due_date, item.frequency);

                        // We need to catch up if it's way behind (e.g. daily that was offline for a week)
                        // For safety, just advance it once per process cycle, or repeatedly until caught up.
                        // Let's just advance it from the due date by the frequency interval.
                        updateRecurring(item.id, { next_due_date: newDueDate });
                        processedCount++;
                    }
                }

                return processedCount;
            }
        }),
        {
            name: 'cashnova-recurring-storage',
        }
    )
);
