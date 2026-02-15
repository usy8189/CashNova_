import { TrendingUp, ArrowDown, ArrowUp, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PredictionCard({ predictions }) {
    if (!predictions) return null;

    const { monthlyProjection, savingsEstimate, budgetAlerts, confidence } = predictions;

    const criticalBudgets = budgetAlerts?.filter(b => b.status !== 'safe') || [];

    return (
        <div className="card p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/40">Spending Forecast</h3>
                <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${confidence === 'high'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : confidence === 'medium'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-white/5 text-white/30'
                        }`}
                >
                    {confidence} confidence
                </span>
            </div>

            {/* Monthly Projection */}
            {monthlyProjection && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white/50 text-xs">
                            <Calendar size={14} />
                            <span>Projected this month</span>
                        </div>
                        <span className="text-lg font-bold text-white">
                            {formatCurrency(monthlyProjection.projectedTotal)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/30">
                        <span>Spent so far: {formatCurrency(monthlyProjection.spentSoFar)}</span>
                        <span>{monthlyProjection.remainingDays} days remaining</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (monthlyProjection.dayOfMonth / monthlyProjection.daysInMonth) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Savings Estimate */}
            {savingsEstimate && (
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                        {savingsEstimate.projectedSavings >= 0 ? (
                            <ArrowUp size={16} className="text-emerald-400" />
                        ) : (
                            <ArrowDown size={16} className="text-red-400" />
                        )}
                        <span className="text-sm text-white/50">Projected savings</span>
                    </div>
                    <span className={`text-sm font-semibold ${savingsEstimate.projectedSavings >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {formatCurrency(Math.abs(savingsEstimate.projectedSavings))}
                        {savingsEstimate.savingsRate !== 0 && (
                            <span className="text-xs text-white/30 ml-1.5">({savingsEstimate.savingsRate}%)</span>
                        )}
                    </span>
                </div>
            )}

            {/* Budget Overflow Warnings */}
            {criticalBudgets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                    <p className="text-xs text-white/30 font-medium">Budget Alerts</p>
                    {criticalBudgets.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-white/60">{b.category}</span>
                            <div className="flex items-center gap-2">
                                <span className={b.status === 'exceeded' ? 'text-red-400' : 'text-amber-400'}>
                                    {b.percentage}%
                                </span>
                                {b.daysUntilOverflow > 0 && b.status === 'warning' && (
                                    <span className="text-white/20">~{b.daysUntilOverflow}d left</span>
                                )}
                                {b.status === 'exceeded' && (
                                    <span className="text-red-400/60">exceeded</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
