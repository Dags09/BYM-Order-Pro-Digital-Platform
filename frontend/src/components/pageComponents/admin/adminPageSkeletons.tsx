import { ChartSkeleton, Skeleton } from "../../skeletonLoader";
import type { ReactNode } from "react";

const pageHeading = (
    titleWidth = "w-40",
    descriptionWidth = "w-72",
) => (
    <div>
        <Skeleton className={`h-8 ${titleWidth}`} />
        <Skeleton className={`mt-2 h-4 max-w-full ${descriptionWidth}`} />
    </div>
);

function LoadingPage({
    label,
    children,
    className = "space-y-5",
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={className}
            role="status"
            aria-label={`Loading ${label}`}
            aria-busy="true"
        >
            {children}
        </div>
    );
}

function DashboardStatSkeleton() {
    return (
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-24" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-3 w-28" />
        </div>
    );
}

function DashboardPanelSkeleton({
    titleWidth,
    chart = false,
    className = "",
}: {
    titleWidth: string;
    chart?: boolean;
    className?: string;
}) {
    return (
        <div
            className={`rounded-lg border border-black/5 bg-white p-5 shadow-sm ${className}`}
        >
            <Skeleton className={`h-4 ${titleWidth}`} />
            {chart ? (
                <ChartSkeleton className="mt-4 h-64" />
            ) : (
                <div className="mt-4 space-y-4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-3"
                        >
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-16 shrink-0" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <LoadingPage label="dashboard" className="space-y-6">
            {pageHeading("w-40")}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-8 w-32 rounded-md" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                    <DashboardStatSkeleton key={index} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-ink/10 bg-white p-5 lg:col-span-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-52 max-w-full" />
                        </div>
                        <div className="space-y-2 text-right">
                            <Skeleton className="ml-auto h-3 w-10" />
                            <Skeleton className="ml-auto h-6 w-12" />
                        </div>
                    </div>
                    <ChartSkeleton className="mt-4 h-56" />
                </div>
                <DashboardStatSkeleton />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <DashboardPanelSkeleton
                    titleWidth="w-44"
                    chart
                    className="lg:col-span-2"
                />
                <DashboardPanelSkeleton titleWidth="w-20" chart />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <DashboardPanelSkeleton titleWidth="w-28" />
                <DashboardPanelSkeleton titleWidth="w-32" />
            </div>
        </LoadingPage>
    );
}

function TableSkeleton({
    columns,
    rows = 5,
    firstCellImage = false,
}: {
    columns: string[];
    rows?: number;
    firstCellImage?: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-ink/10 text-xs uppercase tracking-wide">
                            {columns.map((column, index) => (
                                <th className="px-5 py-3" key={column}>
                                    <Skeleton
                                        className={`h-3 ${index === 0 ? "w-16" : "w-20"}`}
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }, (_, row) => (
                            <tr
                                key={row}
                                className="border-b border-ink/5 last:border-0"
                            >
                                {columns.map((column, index) => (
                                    <td className="px-5 py-3" key={column}>
                                        {index === 0 && firstCellImage ? (
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        ) : (
                                            <Skeleton
                                                className={`h-4 ${index === 0 ? "w-32" : index === 1 ? "w-28" : "w-20"}`}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function AdminProductsSkeleton() {
    return (
        <LoadingPage label="products">
            {pageHeading("w-36")}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Skeleton className="h-10 w-full rounded-md sm:w-64" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
            <TableSkeleton
                columns={["Product", "Category", "Price", "Stock", "Added"]}
                firstCellImage
            />
        </LoadingPage>
    );
}

export function AdminCategoriesSkeleton() {
    return (
        <LoadingPage label="categories">
            {pageHeading("w-40", "w-[30rem]")}
            <Skeleton className="h-10 w-full rounded-md sm:w-72" />
            <TableSkeleton
                columns={["Name", "Description", "Added by", "Created"]}
            />
        </LoadingPage>
    );
}

function OrderRowSkeleton() {
    return (
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="mt-2 h-4 w-64 max-w-full" />
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
            </div>
        </div>
    );
}

export function AdminOrdersSkeleton() {
    return (
        <LoadingPage label="orders">
            {pageHeading("w-32", "w-[30rem]")}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-white p-1">
                    {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-8 w-20 rounded-[4px]"
                        />
                    ))}
                </div>
                <Skeleton className="h-10 w-full rounded-md sm:w-72" />
            </div>
            <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm divide-y divide-ink/5">
                {Array.from({ length: 5 }, (_, index) => (
                    <OrderRowSkeleton key={index} />
                ))}
            </div>
        </LoadingPage>
    );
}

function FeedbackRowSkeleton() {
    return (
        <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-3.5 w-3.5 rounded-full"
                                />
                            ))}
                        </div>
                        <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="mt-2 h-4 w-36" />
                </div>
                <Skeleton className="h-7 w-20 shrink-0 rounded-md" />
            </div>
            <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="mt-2 h-3 w-28" />
        </div>
    );
}

export function AdminFeedbackSkeleton() {
    return (
        <LoadingPage label="feedback">
            <div className="flex flex-wrap items-end justify-between gap-3">
                {pageHeading("w-36", "w-64")}
                <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-4 py-2 shadow-sm">
                    <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, index) => (
                            <Skeleton
                                key={index}
                                className="h-3.5 w-3.5 rounded-full"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-8" />
                </div>
            </div>
            <div className="rounded-lg border border-ink/10 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-kraft/30 p-1">
                        {Array.from({ length: 6 }, (_, index) => (
                            <Skeleton
                                key={index}
                                className="h-7 w-12 rounded-[4px]"
                            />
                        ))}
                    </div>
                    <Skeleton className="h-8 w-full rounded-md sm:w-64" />
                </div>
                <div className="divide-y divide-ink/5">
                    {Array.from({ length: 4 }, (_, index) => (
                        <FeedbackRowSkeleton key={index} />
                    ))}
                </div>
            </div>
        </LoadingPage>
    );
}

export function AdminQrCodesSkeleton() {
    return (
        <LoadingPage label="QR codes">
            <div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-8 w-36" />
                </div>
                <Skeleton className="mt-2 h-4 w-[30rem] max-w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <Skeleton className="h-24 w-24 shrink-0 rounded-md" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <Skeleton className="mt-4 h-9 w-36 rounded-md" />
                    </div>
                ))}
            </div>
        </LoadingPage>
    );
}

export function AdminUsersTableSkeleton() {
    const columns = ["Name", "Role", "Email", "Joined", "Status", "Action"];

    return (
        <div
            className="overflow-x-auto px-5 py-2"
            role="status"
            aria-label="Loading users"
            aria-busy="true"
        >
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-ink/10 text-xs uppercase tracking-wide">
                        {columns.map((column) => (
                            <th className="px-5 py-3" key={column}>
                                <Skeleton className="h-3 w-16" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 4 }, (_, row) => (
                        <tr
                            key={row}
                            className="border-b border-ink/5 last:border-0"
                        >
                            {columns.map((column, index) => (
                                <td className="px-5 py-3" key={column}>
                                    <Skeleton
                                        className={`h-4 ${
                                            index === 0
                                                ? "w-32"
                                                : index === 1
                                                  ? "w-24"
                                                  : index === 2
                                                    ? "w-40"
                                                    : index === 5
                                                      ? "ml-auto w-16"
                                                      : "w-20"
                                        }`}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
