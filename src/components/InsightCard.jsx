import { Info, TrendingUp, TrendingDown, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig = {
    info: { icon: Info, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    positive: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    negative: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    alert: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function InsightCard({ message, type = 'info' }) {
    const config = typeConfig[type] || typeConfig.info;
    const Icon = config.icon;

    return (
        <div className={cn(
            'card flex items-start gap-3',
            type === 'alert' && 'border-red-500/20',
        )}>
            <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                <Icon size={16} className={config.color} />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{message}</p>
        </div>
    );
}
