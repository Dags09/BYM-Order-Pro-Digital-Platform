type PageSkeletonVariant = "table" | "cards" | "detail" | "dashboard";

interface SkeletonProps {
    className?: string;
}

interface PageSkeletonProps {
    variant?: PageSkeletonVariant;
    rows?: number;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <span
            aria-hidden="true"
            className={`block animate-pulse rounded bg-ink/10 ${className}`}
        />
    );
}

export function ChartSkeleton({ className = "h-64" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse ${className}`}
            role="status"
            aria-label="Loading chart"
        >
            <div className="flex h-[88%] flex-col justify-between pb-5 pl-8 pt-2">
                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={index}
                        className="border-t border-dashed border-ink/10"
                    />
                ))}
            </div>
            <div className="ml-8 mr-2 mt-2 flex justify-between">
                {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-2 w-8" />
                ))}
            </div>
        </div>
    );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-black/5 bg-white p-4"
                >
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="mt-4 h-4 w-2/3" />
                    <Skeleton className="mt-3 h-3 w-1/3" />
                </div>
            ))}
        </div>
    );
}

export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div aria-label="Loading rows" role="status">
            {Array.from({ length: rows }, (_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 border-b border-black/5 py-4 last:border-0"
                >
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="hidden h-4 w-24 sm:block" />
                    <Skeleton className="h-7 w-16 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export function PageSkeleton({
    variant = "table",
    rows = 5,
}: PageSkeletonProps) {
    return (
        <div
            className="space-y-6"
            role="status"
            aria-label="Loading page"
            aria-busy="true"
        >
            {variant === "dashboard" ? (
                <>
                    <div>
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-8 w-32 rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }, (_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {Array.from({ length: 2 }, (_, index) => (
                            <SkeletonCard key={index} />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
                            <Skeleton className="h-4 w-36" />
                            <ChartSkeleton className="mt-5 h-64" />
                        </div>
                        <SkeletonPanel rows={5} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <SkeletonPanel rows={4} />
                        <SkeletonPanel rows={4} />
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <Skeleton className="h-8 w-44" />
                        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                    </div>
                    {variant === "detail" ? (
                        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                            <SkeletonPanel rows={6} />
                            <SkeletonPanel rows={4} />
                        </div>
                    ) : variant === "cards" ? (
                        <CardGridSkeleton count={rows} />
                    ) : (
                        <>
                            <div className="flex flex-wrap justify-between gap-3">
                                <Skeleton className="h-9 w-64 rounded-md" />
                                <Skeleton className="h-9 w-28 rounded-md" />
                            </div>
                            <div className="overflow-hidden rounded-lg border border-black/5 bg-white p-5 shadow-sm">
                                <TableRowsSkeleton rows={rows} />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-3 w-28" />
        </div>
    );
}

function SkeletonPanel({ rows }: { rows: number }) {
    return (
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <Skeleton className="h-4 w-32" />
            <div className="mt-5 space-y-5">
                {Array.from({ length: rows }, (_, index) => (
                    <Skeleton key={index} className="h-3 w-full" />
                ))}
            </div>
        </div>
    );
}
