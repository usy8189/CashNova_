import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
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
