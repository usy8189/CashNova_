import { useState } from 'react';
import { Save, Download, Trash2, LogOut, User, Shield, Database } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function SettingsPage() {
    const user = useAuthStore((s) => s.user);
    const updateUser = useAuthStore((s) => s.updateUser);
    const logout = useAuthStore((s) => s.logout);

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const handleSave = async () => {
        const result = await updateUser({ name: profile.name });
        result.success ? toast.success('Profile updated') : toast.error(result.error);
    };

    const handleExport = async () => {
        try {
            const { data } = await api.get('/transactions', { params: { limit: 9999 } });
            const blob = new Blob([JSON.stringify(data.transactions, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cashnova-export.json';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported');
        } catch {
            toast.error('Export failed');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
        try {
            await api.delete('/users/profile');
            logout();
            toast.success('Account deleted');
        } catch {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-2xl space-y-10">
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-sm text-white/40 mt-2">Manage your account</p>
                </div>

                {/* Profile */}
                <div className="card p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <User size={18} className="text-purple-400" />
                        </div>
                        <h2 className="text-base font-semibold text-white/80">Profile</h2>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm text-white/40 font-medium">Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-white/40 font-medium">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <button onClick={handleSave} className="btn btn-primary">
                        <Save size={16} /> Save Changes
                    </button>
                </div>

                {/* Data */}
                <div className="card p-8 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <Database size={18} className="text-indigo-400" />
                        </div>
                        <h2 className="text-base font-semibold text-white/80">Data</h2>
                    </div>
                    <button onClick={handleExport} className="btn btn-ghost w-full justify-start">
                        <Download size={16} /> Export Transactions as JSON
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="card p-8 space-y-5 border-red-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Shield size={18} className="text-red-400" />
                        </div>
                        <h2 className="text-base font-semibold text-red-400/80">Danger Zone</h2>
                    </div>
                    <div className="space-y-3">
                        <button onClick={handleDelete} className="btn btn-danger w-full justify-start">
                            <Trash2 size={16} /> Delete Account
                        </button>
                        <button onClick={logout} className="btn btn-ghost w-full justify-start text-white/40">
                            <LogOut size={16} /> Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
