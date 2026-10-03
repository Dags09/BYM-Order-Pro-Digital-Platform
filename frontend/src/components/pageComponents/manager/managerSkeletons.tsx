import { Skeleton } from "../../skeletonLoader";

function PageHeading({
    titleWidth = "w-40",
}: {
    titleWidth?: string;
}) {
    return (
        <div>
            <Skeleton className={`h-8 ${titleWidth}`} />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
    );
}

function SearchField({ className = "w-full sm:w-72" }: { className?: string }) {
    return (
        <Skeleton
            className={`h-10 rounded-md border border-ink/10 bg-white ${className}`}
        />
    );
}

export function ManagerProductsSkeleton({
    viewMode = "card",
}: {
    viewMode?: "card" | "list";
}) {
    return (
        <div
            className="space-y-5"
            role="status"
            aria-label="Loading products"
            aria-busy="true"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PageHeading />
                <Skeleton className="h-10 w-full rounded-md sm:w-32" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <SearchField className="sm:w-64" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-36 rounded-md" />
                </div>
            </div>
            {viewMode === "card" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 9 }, (_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                        >
                            <Skeleton className="h-36 w-full rounded-none" />
                            <div className="space-y-3 p-4">
                                <Skeleton className="h-3 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-20" />
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                </div>
                                <div className="flex gap-2 border-t border-ink/10 pt-3">
                                    <Skeleton className="h-8 flex-1 rounded-md" />
                                    <Skeleton className="h-8 flex-1 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {Array.from({ length: 6 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 rounded-lg border border-ink/10 bg-white p-3 shadow-sm"
                        >
                            <Skeleton className="h-14 w-14 shrink-0 rounded-md" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-3 w-1/4" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                            <div className="hidden items-center gap-2 sm:flex">
                                <Skeleton className="h-8 w-16 rounded-md" />
                                <Skeleton className="h-8 w-16 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

type OrderCardSize = "small" | "medium" | "large";

const orderCardGrid: Record<OrderCardSize, string> = {
    small: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    medium: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    large: "grid-cols-1 sm:grid-cols-2",
};

export function ManagerOrdersSkeleton({
    viewMode = "list",
    cardSize = "medium",
}: {
    viewMode?: "list" | "card";
    cardSize?: OrderCardSize;
}) {
    return (
        <div
            className="space-y-5"
            role="status"
            aria-label="Loading orders"
            aria-busy="true"
        >
            <PageHeading titleWidth="w-32" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-white p-1">
                    {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-8 w-20 rounded-[4px]"
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <SearchField className="sm:w-72" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                </div>
            </div>
            <div className="flex justify-end">
                <Skeleton className="h-10 w-36 rounded-md" />
            </div>
            {viewMode === "list" ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-4 shadow-sm"
                        >
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-36" />
                                </div>
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex flex-wrap gap-3">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`grid gap-3 ${orderCardGrid[cardSize]}`}>
                    {Array.from(
                        { length: cardSize === "small" ? 10 : cardSize === "large" ? 6 : 9 },
                        (_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="mt-3 h-4 w-2/3" />
                                <Skeleton className="mt-2 h-4 w-3/4" />
                                <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

export function ManagerOrderDetailSkeleton() {
    return (
        <div
            className="space-y-5 pb-10"
            role="status"
            aria-label="Loading order details"
            aria-busy="true"
        >
            <Skeleton className="h-5 w-32" />
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex justify-between gap-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="mt-3 h-4 w-56" />
                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                    <Skeleton className="h-10 w-48 rounded-md" />
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
            </section>
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-6 w-48" />
                <div className="mt-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </section>
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="mt-3 h-5 w-44" />
            </section>
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <Skeleton className="h-4 w-24" />
                <div className="mt-3 divide-y divide-ink/5">
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-4 py-3"
                        >
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-ink/10 pt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </section>
        </div>
    );
}

export function ManagerCategoriesSkeleton() {
    return (
        <div
            className="space-y-5"
            role="status"
            aria-label="Loading categories"
            aria-busy="true"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PageHeading titleWidth="w-44" />
                <Skeleton className="h-10 w-full rounded-md sm:w-36" />
            </div>
            <SearchField />
            <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-kraft/40 text-xs uppercase tracking-wide text-ink/50">
                        <tr>
                            {["w-20", "w-28", "w-20", "w-20", "w-16"].map(
                                (width, index) => (
                                    <th key={index} className="px-5 py-3">
                                        <Skeleton className={`h-3 ${width}`} />
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 7 }, (_, row) => (
                            <tr
                                key={row}
                                className="border-b border-ink/5 last:border-0"
                            >
                                {["w-32", "w-48", "w-28", "w-24", "w-20"].map(
                                    (width, column) => (
                                        <td
                                            key={column}
                                            className="px-5 py-4"
                                        >
                                            <Skeleton
                                                className={`h-4 ${width}`}
                                            />
                                        </td>
                                    ),
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ManagerDriversSkeleton() {
    return (
        <div
            className="space-y-5"
            role="status"
            aria-label="Loading drivers"
            aria-busy="true"
        >
            <PageHeading titleWidth="w-32" />
            <SearchField />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-28" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ManagerDriverDetailSkeleton() {
    return (
        <div
            className="space-y-5 pb-10"
            role="status"
            aria-label="Loading driver details"
            aria-busy="true"
        >
            <Skeleton className="h-5 w-32" />
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-64 max-w-full" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4">
                    {Array.from({ length: 3 }, (_, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2"
                        >
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </section>
            <section className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }, (_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-7 w-16 rounded-[4px]"
                                />
                            ))}
                        </div>
                        <SearchField className="sm:w-48" />
                    </div>
                </div>
                <div className="divide-y divide-ink/5">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export function ManagerDashboardChartSkeleton() {
    return (
        <div
            className="grid h-full min-w-0 grid-cols-[auto_1fr] gap-2"
            role="status"
            aria-label="Loading chart"
            aria-busy="true"
        >
            <div className="col-span-1 flex flex-col justify-between py-1">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-2 w-5" />
                ))}
            </div>
            <div className="relative min-w-0 flex items-end justify-around gap-2 pb-5">
                <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-ink/10" />
                <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-ink/10" />
                <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-ink/10" />
                {[
                    "h-[40%]",
                    "h-[65%]",
                    "h-[52%]",
                    "h-[82%]",
                    "h-[60%]",
                    "h-[92%]",
                    "h-[48%]",
                ].map((height, index) => (
                    <div
                        key={index}
                        className="z-10 flex h-full flex-1 items-end"
                    >
                        <Skeleton
                            className={`w-full rounded-t-sm ${height}`}
                        />
                    </div>
                ))}
                <div className="absolute inset-x-0 bottom-0 flex justify-around gap-2">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} className="h-2 w-7" />
                    ))}
                </div>
            </div>
        </div>
    );
}
