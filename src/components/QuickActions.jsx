import { Plus, ArrowLeftRight, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onAddTransaction }) {
    const navigate = useNavigate();

    // Returns 3 separate elements (fragments) — parent grid handles columns
    return (
        <>
            <button
                onClick={onAddTransaction}
                className="quick-action-btn group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] py-5 transition-all hover:bg-indigo-500/10 hover:border-indigo-500/20"
            >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                    <Plus size={20} className="text-indigo-400" />
                </div>
                <span className="text-xs text-white/50 font-medium text-center">Add Transaction</span>
            </button>

            <button
                onClick={() => navigate('/transactions')}
                className="quick-action-btn group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] py-5 transition-all hover:bg-purple-500/10 hover:border-purple-500/20"
            >
                <div className="p-2.5 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <ArrowLeftRight size={20} className="text-purple-400" />
                </div>
                <span className="text-xs text-white/50 font-medium text-center">Transactions</span>
            </button>

            <button
                onClick={() => navigate('/analytics')}
                className="quick-action-btn group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] py-5 transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20"
            >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <PieChart size={20} className="text-emerald-400" />
                </div>
                <span className="text-xs text-white/50 font-medium text-center">Analytics</span>
            </button>
        </>
    );
}
