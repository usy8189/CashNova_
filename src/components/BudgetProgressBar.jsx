import { cn, formatCurrency } from '@/lib/utils';

export default function BudgetProgressBar({ category, spent, limit, percentage }) {
    const pct = Math.min(percentage || (limit > 0 ? (spent / limit) * 100 : 0), 100);
    const isOver = pct >= 100;
    const isWarning = pct >= 75 && !isOver;

    const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

    return (
        <div className="card space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">{category}</span>
                <span className="text-xs text-white/40">
                    {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', barColor)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-xs">
                <span className={cn(
                    isOver ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/30'
                )}>
                    {pct.toFixed(0)}% used
                </span>
                <span className="text-white/30">
                    {formatCurrency(Math.max(limit - spent, 0))} left
                </span>
            </div>
        </div>
    );
}
