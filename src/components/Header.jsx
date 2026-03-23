import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart3, Target, Settings, LogOut, Repeat, Flag } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/recurring', label: 'Recurring', icon: Repeat },
    { to: '/goals', label: 'Goals', icon: Flag },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Header() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.06]"
            style={{
                background: 'rgba(10, 10, 10, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}
        >
            <div className="w-full px-10 lg:px-16 h-16 flex items-center justify-between">
                {/* Brand */}
                <span className="text-lg font-bold tracking-tight text-white">
                    CashNova
                </span>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-4">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'text-purple-400'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                                }`
                            }
                        >
                            <Icon size={16} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                {user?.name ? getInitials(user.name) : '?'}
                            </div>
                        )}
                        <span className="hidden sm:block text-sm text-white/60 font-medium">
                            {user?.name || 'Guest'}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Log out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
