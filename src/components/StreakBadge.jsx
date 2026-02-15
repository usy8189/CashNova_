import { Flame, Calendar } from 'lucide-react';

export default function StreakBadge({ transactions = [] }) {
    // Calculate consecutive days with at least one transaction
    const streak = calculateStreak(transactions);
    const totalDays = calculateTotalActiveDays(transactions);

    if (totalDays === 0) return null;

    return (
        <div className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${streak >= 7 ? 'bg-orange-500/10' : streak >= 3 ? 'bg-amber-500/10' : 'bg-white/[0.04]'
                }`}>
                <Flame size={22} className={
                    streak >= 7 ? 'text-orange-400 animate-pulse' : streak >= 3 ? 'text-amber-400' : 'text-white/30'
                } />
            </div>
            <div className="flex-1">
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold ${streak >= 7 ? 'text-orange-400' : streak >= 3 ? 'text-amber-400' : 'text-white/50'
                        }`}>{streak}</span>
                    <span className="text-xs text-white/30">day streak</span>
                </div>
                <p className="text-xs text-white/20 mt-0.5">{totalDays} total active days</p>
            </div>
            {streak >= 7 && (
                <span className="text-xs bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full font-medium">
                    🔥 On fire!
                </span>
            )}
            {streak >= 3 && streak < 7 && (
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full font-medium">
                    Keep going!
                </span>
            )}
        </div>
    );
}

function calculateStreak(transactions) {
    if (transactions.length === 0) return 0;

    const days = new Set();
    transactions.forEach(t => {
        const date = new Date(t.transactionDate || t.date);
        days.add(date.toISOString().slice(0, 10));
    });

    const sortedDays = [...days].sort().reverse();
    const today = new Date().toISOString().slice(0, 10);

    // Check if today or yesterday has a transaction (to keep streak alive)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (!sortedDays.includes(today) && !sortedDays.includes(yesterday)) return 0;

    let streak = 0;
    let checkDate = new Date(sortedDays[0]);

    for (const day of sortedDays) {
        const expected = checkDate.toISOString().slice(0, 10);
        if (day === expected) {
            streak++;
            checkDate = new Date(checkDate - 86400000);
        } else {
            break;
        }
    }

    return streak;
}

function calculateTotalActiveDays(transactions) {
    const days = new Set();
    transactions.forEach(t => {
        const date = new Date(t.transactionDate || t.date);
        days.add(date.toISOString().slice(0, 10));
    });
    return days.size;
}
