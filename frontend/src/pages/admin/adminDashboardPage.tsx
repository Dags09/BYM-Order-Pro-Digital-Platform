import { useEffect, useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    Wallet,
    ShoppingCart,
    Users,
    Package,
    AlertTriangle,
    Star,
} from "lucide-react";
import api from "../../lib/axios";
import StatCard from "../../components/pageComponents/admin/statCard";
import {
    ChartSkeleton,
    PageSkeleton,
    Skeleton,
} from "../../components/skeletonLoader";
import { formatPrice, formatShortDate } from "../../utils/formatters";
import type { DashboardStats, RevenueSummary } from "../../types/dashboard";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type RangePreset = "all" | "today" | "week" | "month" | "year" | "custom";

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
    { value: "custom", label: "Custom" },
];

// Computes the [from, to] window for a preset — mirrors the manager
// dashboard's getDateRange so both filters behave identically. "All time"
// returns null, which tells the fetch below to omit from/to entirely.
function computeRange(
    preset: RangePreset,
    customFrom: string,
    customTo: string,
): { from: Date; to: Date } | null {
    if (preset === "all") return null;

    const today = new Date();
    const to = new Date(today);
    to.setHours(23, 59, 59, 999);

    if (preset === "custom") {
        const from = customFrom ? new Date(`${customFrom}T00:00:00`) : today;
        const customEnd = customTo ? new Date(`${customTo}T23:59:59.999`) : to;
        return { from, to: customEnd >= from ? customEnd : from };
    }

    const from = new Date(today);
    if (preset === "today") {
        from.setHours(0, 0, 0, 0);
    } else if (preset === "week") {
        from.setHours(0, 0, 0, 0);
        from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
    } else if (preset === "month") {
        from.setHours(0, 0, 0, 0);
        from.setDate(1);
    } else {
        from.setHours(0, 0, 0, 0);
        from.setMonth(0, 1);
    }

    return { from, to };
}

interface RangeFilterProps {
    value: RangePreset;
    onChange: (value: RangePreset) => void;
    customFrom: string;
    customTo: string;
    onCustomFromChange: (value: string) => void;
    onCustomToChange: (value: string) => void;
}

// Matches the manager dashboard's DateFilter — same options, same markup
// and styling — so the two consoles feel like one product.
function DateFilter({
    value,
    onChange,
    customFrom,
    customTo,
    onCustomFromChange,
    onCustomToChange,
}: RangeFilterProps) {
    return (
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as RangePreset)
                }
                className="w-full rounded-md border border-ink/15 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-crate-light sm:w-auto"
                aria-label="Revenue date range"
            >
                {RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {value === "custom" && (
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
                    <span className="hidden text-xs text-black sm:inline">
                        From
                    </span>
                    <input
                        type="date"
                        value={customFrom}
                        onChange={(event) =>
                            onCustomFromChange(event.target.value)
                        }
                        className="w-full min-w-0 rounded-md bg-white border border-ink/15 px-2 py-1.5 text-xs text-ink outline-none focus:border-crate-light"
                        aria-label="Revenue start date"
                    />
                    <span className="hidden text-xs text-black sm:inline">
                        To
                    </span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={(event) =>
                            onCustomToChange(event.target.value)
                        }
                        className="w-full min-w-0 rounded-md  bg-white border border-ink/15 px-2 py-1.5 text-xs text-ink outline-none focus:border-crate-light"
                        aria-label="Revenue end date"
                    />
                </div>
            )}
        </div>
    );
}

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

function formatInputDate(value: string, fallback: string) {
    if (!value) return fallback;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function DashboardSkeleton() {
    return <PageSkeleton variant="dashboard" />;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Mirrors the manager dashboard's own filter state/defaults.
    const [preset, setPreset] = useState<RangePreset>("today");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [summary, setSummary] = useState<RevenueSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const range = useMemo(
        () => computeRange(preset, customFrom, customTo),
        [preset, customFrom, customTo],
    );

    useEffect(() => {
        api.get("/dashboard/stats")
            .then(({ data }) => setStats(data.stats))
            .catch(() => setError("Couldn't load dashboard stats."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setSummaryLoading(true);
        setSummaryError(null);
        api.get("/dashboard/revenue-summary", {
            params: {
                ...(range && {
                    from: range.from.toISOString(),
                    to: range.to.toISOString(),
                }),
                interval: preset === "today" ? "hour" : "day",
            },
        })
            .then(({ data }) => setSummary(data))
            .catch((err) =>
                setSummaryError(
                    getErrorMessage(err, "Couldn't load this date range."),
                ),
            )
            .finally(() => setSummaryLoading(false));
    }, [preset, range]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error || !stats) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error ?? "Something went wrong."}
            </div>
        );
    }

    const trendData = (summary?.revenueTrend ?? []).map((d) => ({
        ...d,
        label:
            preset === "today"
                ? `${Number(d.date.slice(-2)) % 12 || 12} ${Number(d.date.slice(-2)) < 12 ? "AM" : "PM"}`
                : formatShortDate(d.date),
    }));
    const rangeLabel =
        preset === "custom"
            ? `${formatInputDate(customFrom, "Start date")} to ${formatInputDate(customTo, "End date")}`
            : (RANGE_OPTIONS.find((option) => option.value === preset)?.label ??
              "Selected range");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Overview of orders, revenue, and stock across the platform.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-ink/50">
                    Revenue and top products for the selected period
                </p>
                <DateFilter
                    value={preset}
                    onChange={setPreset}
                    customFrom={customFrom}
                    customTo={customTo}
                    onCustomFromChange={setCustomFrom}
                    onCustomToChange={setCustomTo}
                />
            </div>
            {summaryError && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-3 text-sm text-route">
                    {summaryError}
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total revenue"
                    value={formatPrice(summary?.revenue.total ?? 0)}
                    icon={Wallet}
                    accent="crate"
                    loading={summaryLoading}
                    footnote={`${summary?.revenue.totalOrders ?? 0} completed orders`}
                />
                <StatCard
                    label="Orders"
                    value={String(
                        summary?.ordersByStatus.reduce(
                            (s, o) => s + o.count,
                            0,
                        ) ?? 0,
                    )}
                    icon={ShoppingCart}
                    accent="signal"
                    loading={summaryLoading}
                    footnote={`${
                        summary?.ordersByStatus.find(
                            (o) => o.status === "pending",
                        )?.count ?? 0
                    } pending`}
                />
                <StatCard
                    label="Customers"
                    value={String(stats.users.customers)}
                    icon={Users}
                    accent="ink"
                    footnote={`${stats.users.staff} staff accounts`}
                />
                <StatCard
                    label="Products sold"
                    value={String(summary?.products.unitsSold ?? 0)}
                    icon={Package}
                    accent="crate"
                    loading={summaryLoading}
                    footnote={`${summary?.products.distinctProducts ?? 0} distinct products`}
                />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard
                    label="Low stock items"
                    value={String(stats.products.lowStock)}
                    icon={AlertTriangle}
                    accent="route"
                    footnote="Fewer than 10 units in stock"
                />
                <StatCard
                    label="Average rating"
                    value={
                        stats.feedback.total > 0
                            ? stats.feedback.avgRating.toFixed(1)
                            : "—"
                    }
                    icon={Star}
                    accent="signal"
                    footnote={`from ${stats.feedback.total} reviews`}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
                    <h2 className="font-display text-sm font-semibold text-ink">
                        Revenue — {rangeLabel}
                    </h2>
                    {summaryLoading ? (
                        <ChartSkeleton className="mt-4 h-64" />
                    ) : (
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={trendData}
                                    margin={{
                                        top: 5,
                                        right: 10,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="revenueFill"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#2f6b4f"
                                                stopOpacity={0.35}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#2f6b4f"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#1b2420"
                                        strokeOpacity={0.08}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11, fill: "#1b2420" }}
                                        axisLine={{
                                            stroke: "#1b2420",
                                            strokeOpacity: 0.1,
                                        }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#1b2420" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={70}
                                        tickFormatter={(v) => formatPrice(v)}
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            formatPrice(Number(value))
                                        }
                                        contentStyle={{
                                            borderRadius: 8,
                                            border: "1px solid rgba(27,36,32,0.1)",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2f6b4f"
                                        strokeWidth={2}
                                        fill="url(#revenueFill)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
                    <h2 className="font-display text-sm font-semibold text-ink">
                        Orders by status
                    </h2>
                    <div className="mt-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.ordersByStatus.map((s) => ({
                                    ...s,
                                    label: STATUS_LABELS[s.status],
                                }))}
                                layout="vertical"
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1b2420"
                                    strokeOpacity={0.08}
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: "#1b2420" }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: "#1b2420" }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={70}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: "1px solid rgba(27,36,32,0.1)",
                                        fontSize: 12,
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[0, 4, 4, 0]}
                                    barSize={16}
                                >
                                    {stats.ordersByStatus.map((s) => (
                                        <Cell
                                            key={s.status}
                                            fill={STATUS_COLORS[s.status]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top products + recent orders */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-sm font-semibold text-ink">
                            Top products
                        </h2>
                    </div>
                    {summaryLoading ? (
                        <ul className="mt-4 space-y-4" aria-hidden="true">
                            {Array.from({ length: 5 }, (_, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-16" />
                                </li>
                            ))}
                        </ul>
                    ) : !summary || summary.topProducts.length === 0 ? (
                        <p className="mt-4 text-sm text-ink/50">
                            No sales in this date range.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {summary.topProducts.map((p, i) => (
                                <li
                                    key={p.productId}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-kraft-dark font-mono text-[11px] font-semibold text-ink">
                                            {i + 1}
                                        </span>
                                        <span className="truncate text-sm text-ink">
                                            {p.name}
                                        </span>
                                    </div>
                                    <div className="flex-none text-right">
                                        <p className="font-mono text-sm font-medium text-ink">
                                            {formatPrice(p.revenue)}
                                        </p>
                                        <p className="text-[11px] text-ink/50">
                                            {p.unitsSold} sold
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
                    <h2 className="font-display text-sm font-semibold text-ink">
                        Recent orders
                    </h2>
                    {stats.recentOrders.length === 0 ? (
                        <p className="mt-4 text-sm text-ink/50">
                            No orders yet.
                        </p>
                    ) : (
                        <ul className="mt-4 divide-y divide-black/5">
                            {stats.recentOrders.map((o) => (
                                <li
                                    key={o._id}
                                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-ink">
                                            {o.customer
                                                ? `${o.customer.firstName} ${o.customer.lastName}`
                                                : "Unknown customer"}
                                        </p>
                                        <p className="text-[11px] text-ink/50">
                                            {formatShortDate(o.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-none items-center gap-2">
                                        <span
                                            className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                                            style={{
                                                backgroundColor:
                                                    STATUS_COLORS[o.status],
                                            }}
                                        >
                                            {STATUS_LABELS[o.status]}
                                        </span>
                                        <span className="font-mono text-sm font-medium text-ink">
                                            {formatPrice(o.totalAmount)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
