import { useState } from 'react';
import { Plus, Repeat, Play, Pause, Trash2, Edit2 } from 'lucide-react';
import { useRecurringStore } from '@/store/recurringStore';
import RecurringForm from '@/components/RecurringForm';
import CategoryBadge from '@/components/CategoryBadge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RecurringPage() {
    const { recurringItems, addRecurring, updateRecurring, deleteRecurring, toggleStatus } = useRecurringStore();
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const handleAdd = async (data) => {
        const result = await addRecurring(data);
        if (result.success) {
            toast.success('Recurring transaction added');
            setShowForm(false);
        } else {
            toast.error(result.error || 'Failed to add');
        }
    };

    const handleEdit = async (data) => {
        const result = await updateRecurring(editData.id, data);
        if (result.success) {
            toast.success('Recurring transaction updated');
            setShowForm(false);
            setEditData(null);
        } else {
            toast.error(result.error || 'Failed to update');
        }
    };

    const handleDelete = (id) => {
        deleteRecurring(id);
        toast.success('Recurring transaction deleted');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Repeat size={24} className="text-purple-400" />
                        Recurring
                    </h1>
                    <p className="text-sm text-white/40 mt-1">{recurringItems.length} active automations</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> Add Recurring
                </button>
            </div>

            {/* List */}
            {recurringItems.length === 0 ? (
                <div className="card text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <Repeat size={24} className="text-white/20" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Automations Yet</h3>
                    <p className="text-sm text-white/40 max-w-sm mx-auto">
                        Set up your regular bills or income here to have them automatically recorded on their due dates.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {recurringItems.map((t) => (
                        <div
                            key={t.id}
                            className={cn(
                                "card flex flex-col sm:flex-row sm:items-center gap-4 py-5 transition-colors group",
                                t.status === 'paused' ? 'opacity-50' : 'hover:bg-white/[0.02]'
                            )}
                        >
                            {/* Category + Description */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <p className="text-sm font-medium text-white/90 truncate">
                                        {t.title}
                                    </p>
                                    <CategoryBadge category={t.category} />
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/5 text-white/40">
                                        {t.frequency}
                                    </span>
                                </div>
                                <p className="text-xs text-white/30 flex items-center gap-2">
                                    Next Due: {formatDate(t.next_due_date)}
                                    {t.autoAdd && <span className="text-purple-400/80">• Auto-Add</span>}
                                </p>
                            </div>

                            {/* Amount */}
                            <span className={cn(
                                'text-base font-semibold tabular-nums whitespace-nowrap',
                                t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                            )}>
                                {t.type === 'income' ? '+' : '−'}{formatCurrency(t.amount)}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                                <button
                                    onClick={() => toggleStatus(t.id)}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title={t.status === 'active' ? 'Pause' : 'Resume'}
                                >
                                    {t.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button
                                    onClick={() => { setEditData(t); setShowForm(true); }}
                                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Forms */}
            {showForm && (
                <RecurringForm
                    onSubmit={editData ? handleEdit : handleAdd}
                    onClose={() => { setShowForm(false); setEditData(null); }}
                    editingItem={editData}
                />
            )}
        </div>
    );
}
