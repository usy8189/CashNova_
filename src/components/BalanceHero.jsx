import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';

function AnimatedValue({ value, prefix = '' }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        const duration = 800;
        const steps = 30;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(Math.round(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);

    return <>{formatCurrency(display)}</>;
}

export default function BalanceHero({ income, expense, balance, todayExpense = 0 }) {
    const isPositive = balance >= 0;

    return (
        <div className="balance-hero relative overflow-hidden rounded-2xl p-8">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

            <div className="relative z-10">
                {/* Top label */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-white/5">
                        <Wallet size={20} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-white/40">Total Balance</span>
                </div>

                {/* Big Balance */}
                <h2 className={`text-5xl font-bold tracking-tight mb-1 ${isPositive ? 'text-white' : 'text-red-400'}`}>
                    <AnimatedValue value={Math.abs(balance)} />
                </h2>
                {!isPositive && <p className="text-xs text-red-400/60 mb-4">You're in deficit</p>}
                {isPositive && <p className="text-xs text-white/20 mb-6">&nbsp;</p>}

                {/* Income / Expense / Today pills */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/10 rounded-xl px-4 py-2.5">
                        <ArrowUpRight size={16} className="text-emerald-400" />
                        <div>
                            <p className="text-[10px] text-emerald-400/60 font-medium uppercase tracking-wider">Income</p>
                            <p className="text-sm font-semibold text-emerald-400">{formatCurrency(income)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/10 rounded-xl px-4 py-2.5">
                        <ArrowDownRight size={16} className="text-red-400" />
                        <div>
                            <p className="text-[10px] text-red-400/60 font-medium uppercase tracking-wider">Expenses</p>
                            <p className="text-sm font-semibold text-red-400">{formatCurrency(expense)}</p>
                        </div>
                    </div>
                    {todayExpense > 0 && (
                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
                            <TrendingDown size={16} className="text-white/40" />
                            <div>
                                <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Today</p>
                                <p className="text-sm font-semibold text-white/70">{formatCurrency(todayExpense)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
