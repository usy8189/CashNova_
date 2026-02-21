import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useRecurringStore } from '@/store/recurringStore';
import { useTransactionStore } from '@/store/transactionStore';

export default function Layout() {
    const processDueTransactions = useRecurringStore(s => s.processDueTransactions);
    const addTransaction = useTransactionStore(s => s.addTransaction);

    useEffect(() => {
        processDueTransactions(addTransaction);
    }, [processDueTransactions, addTransaction]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white/90">
            <Header />
            <main style={{ padding: '72px 80px' }}>
                <div className="animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
