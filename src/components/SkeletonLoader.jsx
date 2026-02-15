export function SkeletonLine({ className = '' }) {
    return (
        <div className={`bg-white/[0.04] rounded-lg animate-pulse-subtle ${className}`} />
    );
}

export function SkeletonCard() {
    return (
        <div className="card space-y-4">
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="h-8 w-32" />
            <SkeletonLine className="h-3 w-20" />
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="card flex items-center gap-4 py-4">
            <div className="flex-1 space-y-2">
                <SkeletonLine className="h-4 w-40" />
                <SkeletonLine className="h-3 w-24" />
            </div>
            <SkeletonLine className="h-5 w-20" />
        </div>
    );
}
