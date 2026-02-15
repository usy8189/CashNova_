export const CATEGORIES = [
    { name: 'Food & Dining', color: '#f97316', icon: 'UtensilsCrossed' },
    { name: 'Transportation', color: '#3b82f6', icon: 'Car' },
    { name: 'Shopping', color: '#8b5cf6', icon: 'ShoppingBag' },
    { name: 'Entertainment', color: '#ec4899', icon: 'Gamepad2' },
    { name: 'Bills & Utilities', color: '#eab308', icon: 'Zap' },
    { name: 'Healthcare', color: '#10b981', icon: 'Heart' },
    { name: 'Education', color: '#06b6d4', icon: 'GraduationCap' },
    { name: 'Travel', color: '#f43f5e', icon: 'Plane' },
    { name: 'Groceries', color: '#84cc16', icon: 'Apple' },
    { name: 'Salary', color: '#22c55e', icon: 'Banknote' },
    { name: 'Freelance', color: '#a855f7', icon: 'Laptop' },
    { name: 'Investment', color: '#14b8a6', icon: 'TrendingUp' },
    { name: 'Other', color: '#64748b', icon: 'MoreHorizontal' },
];

export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
};

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function getCategoryColor(categoryName) {
    const cat = CATEGORIES.find(
        (c) => c.name.toLowerCase() === categoryName?.toLowerCase()
    );
    return cat?.color || '#64748b';
}
