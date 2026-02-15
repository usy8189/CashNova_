import { cn, formatCurrency } from '@/lib/utils';

export default function StatCard({ label, value, icon: Icon, trend, type = 'default' }) {
    const colors = {
        income: 'text-emerald-400',
        expense: 'text-red-400',
        default: 'text-white',
    };

    const iconBg = {
        income: 'bg-emerald-500/10 text-emerald-400',
        expense: 'bg-red-500/10 text-red-400',
        default: 'bg-indigo-500/10 text-indigo-400',
    };

    return (
        <div className="card">
            <div className="flex items-start justify-between mb-4">
                <span className="text-sm text-white/40 font-medium">{label}</span>
                {Icon && (
                    <div className={cn('p-2 rounded-lg', iconBg[type] || iconBg.default)}>
                        <Icon size={18} />
                    </div>
                )}
            </div>
            <p className={cn('text-2xl font-bold tracking-tight', colors[type] || colors.default)}>
                {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
            {trend && (
                <p className="text-xs text-white/30 mt-2">{trend}</p>
            )}
        </div>
    );
}
