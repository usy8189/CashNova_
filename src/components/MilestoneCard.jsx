import { Trophy, Star, Target, Shield, Zap, Award } from 'lucide-react';

const milestones = [
    { id: 'first_tx', label: 'First Transaction', icon: Star, threshold: 1, unit: 'transactions', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 'ten_tx', label: '10 Transactions', icon: Zap, threshold: 10, unit: 'transactions', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'fifty_tx', label: '50 Transactions', icon: Award, threshold: 50, unit: 'transactions', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'first_1k', label: 'First ₹1K Saved', icon: Target, threshold: 1000, unit: 'savings', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'first_10k', label: '₹10K Saved', icon: Shield, threshold: 10000, unit: 'savings', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { id: 'first_50k', label: '₹50K Saved', icon: Trophy, threshold: 50000, unit: 'savings', color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export default function MilestoneCard({ transactionCount = 0, totalSavings = 0 }) {
    const getValue = (unit) => {
        if (unit === 'transactions') return transactionCount;
        if (unit === 'savings') return totalSavings;
        return 0;
    };

    const earned = milestones.filter(m => getValue(m.unit) >= m.threshold);
    const next = milestones.find(m => getValue(m.unit) < m.threshold);

    if (earned.length === 0 && !next) return null;

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    <span className="text-sm font-medium text-white/40">Milestones</span>
                </div>
                <span className="text-xs text-white/20">{earned.length}/{milestones.length}</span>
            </div>

            {/* Earned badges */}
            <div className="flex flex-wrap gap-2 mb-4">
                {earned.map((m) => {
                    const Icon = m.icon;
                    return (
                        <div
                            key={m.id}
                            className={`flex items-center gap-1.5 ${m.bg} rounded-lg px-3 py-1.5 milestone-earned`}
                            title={m.label}
                        >
                            <Icon size={14} className={m.color} />
                            <span className={`text-xs font-medium ${m.color}`}>{m.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Next milestone */}
            {next && (
                <div className="border-t border-white/[0.04] pt-3">
                    <p className="text-xs text-white/25 mb-2">Next milestone</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <next.icon size={14} className="text-white/20" />
                            <span className="text-xs text-white/40">{next.label}</span>
                        </div>
                        <span className="text-xs text-white/20">
                            {getValue(next.unit)} / {next.threshold.toLocaleString()}
                        </span>
                    </div>
                    {/* Mini progress */}
                    <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden mt-2">
                        <div
                            className="h-full rounded-full bg-indigo-500/50 transition-all duration-1000"
                            style={{ width: `${Math.min(100, (getValue(next.unit) / next.threshold) * 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
