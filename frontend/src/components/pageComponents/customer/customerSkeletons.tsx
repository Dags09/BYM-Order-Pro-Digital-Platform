import { Skeleton } from "../../skeletonLoader";

export function ShopGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="status"
            aria-label="Loading products"
            aria-busy="true"
        >
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="flex flex-col overflow-hidden rounded-lg border-2 border-ink bg-white shadow-[4px_4px_0_0_theme(colors.ink)]"
                >
                    <div className="relative flex h-40 items-center justify-center border-b-2 border-ink bg-kraft-dark/60">
                        <Skeleton className="absolute right-2 top-2 h-5 w-20 rounded" />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-2 h-3 w-1/3" />
                        <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink/20 pt-3">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="mt-auto flex items-center gap-2 pt-4">
                            <Skeleton className="h-9 w-28 rounded-md" />
                            <Skeleton className="h-8 flex-1 rounded-md" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ShopListSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <div
            className="overflow-hidden rounded-lg border-2 border-ink bg-white shadow-[4px_4px_0_0_theme(colors.ink)]"
            role="status"
            aria-label="Loading products"
            aria-busy="true"
        >
            <div className="hidden border-b-2 border-ink bg-kraft-dark/40 px-4 py-2 sm:flex sm:items-center sm:gap-4">
                <Skeleton className="h-3 w-64 shrink-0" />
                <Skeleton className="h-3 w-28 shrink-0" />
                <Skeleton className="h-3 w-32 shrink-0" />
                <Skeleton className="ml-auto h-3 w-64 shrink-0" />
            </div>
            {Array.from({ length: rows }, (_, index) => (
                <div
                    key={index}
                    className="flex flex-col gap-3 border-b-2 border-ink/10 bg-white p-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                    <div className="flex min-w-0 items-center gap-3 sm:w-64 sm:shrink-0">
                        <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between sm:w-28 sm:shrink-0 sm:justify-start">
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center justify-between sm:w-32 sm:shrink-0">
                        <Skeleton className="h-5 w-20 rounded" />
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto sm:w-64 sm:shrink-0 sm:justify-end">
                        <Skeleton className="h-9 w-28 rounded-md" />
                        <Skeleton className="h-8 flex-1 rounded-md sm:flex-none sm:w-28" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function HomeProductsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            role="status"
            aria-label="Loading featured products"
            aria-busy="true"
        >
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-lg border-2 border-ink bg-white shadow-[3px_3px_0_0_theme(colors.ink)]"
                >
                    <div className="relative flex h-44 items-center justify-center border-b-2 border-ink bg-kraft-dark/60">
                        <Skeleton className="absolute right-2 top-2 h-5 w-20 rounded" />
                        <Skeleton className="h-16 w-16 rounded-md bg-white/70" />
                    </div>
                    <div className="p-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-2 h-3 w-1/3" />
                        <div className="mt-3 flex items-center justify-between border-t border-dashed border-ink/20 pt-3">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ProfilePageSkeleton() {
    return (
        <div
            className="grid gap-6 lg:grid-cols-[1fr_320px]"
            role="status"
            aria-label="Loading profile"
            aria-busy="true"
        >
            <div className="space-y-6">
                <section className="rounded-lg border-2 border-ink bg-white p-6 shadow-[4px_4px_0_0_theme(colors.crate)]">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-5 w-40 max-w-full" />
                            <Skeleton className="h-3 w-32 max-w-full" />
                            <Skeleton className="h-4 w-20 rounded" />
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border-2 border-ink bg-white p-6">
                    <Skeleton className="h-5 w-44" />
                    <div className="mt-5 space-y-5">
                        {Array.from({ length: 3 }, (_, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-40 max-w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-lg border-2 border-ink bg-white p-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="mt-4 h-4 w-3/4" />
                    <Skeleton className="mt-4 h-3 w-24" />
                </section>
            </div>

            <aside className="h-fit space-y-3">
                {Array.from({ length: 2 }, (_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border-2 border-ink bg-white p-4"
                    >
                        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </div>
                ))}
            </aside>
        </div>
    );
}

export function CheckoutQrSkeleton() {
    return (
        <div
            className="mt-3 flex items-start gap-4"
            role="status"
            aria-label="Loading payment QR code"
            aria-busy="true"
        >
            <Skeleton className="h-28 w-28 shrink-0 rounded-md" />
            <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    );
}
