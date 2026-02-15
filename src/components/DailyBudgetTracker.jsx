import { Target, Flame } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DailyBudgetTracker({ spentToday = 0, dailyLimit = 0 }) {
    if (dailyLimit <= 0) return null;

    const percentage = Math.min(100, (spentToday / dailyLimit) * 100);
    const remaining = Math.max(0, dailyLimit - spentToday);
    const isOverBudget = spentToday > dailyLimit;
    const isWarning = percentage > 70 && !isOverBudget;

    const barColor = isOverBudget
        ? 'bg-red-500'
        : isWarning
            ? 'bg-amber-500'
            : 'bg-emerald-500';

    const statusText = isOverBudget
        ? `Over by ${formatCurrency(spentToday - dailyLimit)}`
        : `${formatCurrency(remaining)} remaining`;

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium text-white/50">Daily Budget</span>
                </div>
                <span className="text-xs text-white/30">{formatCurrency(spentToday)} / {formatCurrency(dailyLimit)}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                />
            </div>

            <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                    {statusText}
                </span>
                <span className="text-xs text-white/20">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
}
