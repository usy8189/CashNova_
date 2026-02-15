import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AlertBanner({ alerts = [] }) {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(a => a.severity === 'high');
    const warningAlerts = alerts.filter(a => a.severity !== 'high');

    return (
        <div className="space-y-3">
            {criticalAlerts.map((alert, i) => (
                <div
                    key={`critical-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4"
                >
                    <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
                        <ShieldAlert size={18} className="text-red-400" />
                    </div>
                    <p className="text-sm text-red-300 leading-relaxed">{alert.message}</p>
                </div>
            ))}
            {warningAlerts.map((alert, i) => (
                <div
                    key={`warning-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 px-5 py-4"
                >
                    <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                        <AlertTriangle size={18} className="text-amber-400" />
                    </div>
                    <p className="text-sm text-amber-300/80 leading-relaxed">{alert.message}</p>
                </div>
            ))}
        </div>
    );
}
