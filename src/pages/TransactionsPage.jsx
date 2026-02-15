import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import { SkeletonRow } from '@/components/SkeletonLoader';
import { CATEGORIES } from '@/lib/constants';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
    const {
        transactions, loading, filter,
        fetchTransactions, addTransaction, updateTransaction, deleteTransaction, setFilter,
    } = useTransactionStore();

    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const handleAdd = async (data) => {
        const result = await addTransaction(data);
        result.success ? toast.success('Added') : toast.error(result.error);
    };

    const handleEdit = async (data) => {
        const result = await updateTransaction(editData.id, data);
        result.success ? toast.success('Updated') : toast.error(result.error);
        setEditData(null);
    };

    const handleDelete = async (id) => {
        const result = await deleteTransaction(id);
        result.success ? toast.success('Deleted') : toast.error(result.error);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Transactions</h1>
                    <p className="text-sm text-white/40 mt-1">{transactions.length} total</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={16} /> Add Transaction
                </button>
            </div>

            {/* Filters */}
            <div className="card flex flex-wrap items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={filter.search}
                        onChange={(e) => setFilter({ search: e.target.value })}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>

                {/* Type filter */}
                <select
                    value={filter.type}
                    onChange={(e) => setFilter({ type: e.target.value })}
                    className="w-auto"
                >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                {/* Category filter */}
                <select
                    value={filter.category}
                    onChange={(e) => setFilter({ category: e.target.value })}
                    className="w-auto"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            {loading && transactions.length === 0 ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : (
                <TransactionList
                    transactions={transactions}
                    onEdit={(t) => { setEditData(t); setShowForm(true); }}
                    onDelete={handleDelete}
                />
            )}

            {/* Forms */}
            {showForm && !editData && (
                <TransactionForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />
            )}
            {showForm && editData && (
                <TransactionForm onSubmit={handleEdit} onClose={() => { setShowForm(false); setEditData(null); }} initialData={editData} />
            )}
        </div>
    );
}
