import { formatCurrency, formatDate, cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';

export default function TransactionList({ transactions = [], onEdit, onDelete, showActions = true }) {
    if (transactions.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-white/30 text-sm">No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {transactions.map((t) => (
                <div
                    key={t.id}
                    className="card flex items-center gap-4 py-5 hover:bg-white/[0.02] transition-colors group"
                >
                    {/* Category + Description */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <p className="text-sm font-medium text-white/90 truncate">
                                {t.description}
                            </p>
                            <CategoryBadge category={t.category} />
                        </div>
                        <p className="text-xs text-white/30">
                            {formatDate(t.date || t.transactionDate)}
                        </p>
                    </div>

                    {/* Amount */}
                    <span className={cn(
                        'text-sm font-semibold tabular-nums whitespace-nowrap',
                        t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    )}>
                        {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                    </span>

                    {/* Actions */}
                    {showActions && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(t)}
                                    className="px-2.5 py-1.5 text-xs text-white/40 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(t.id)}
                                    className="px-2.5 py-1.5 text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
