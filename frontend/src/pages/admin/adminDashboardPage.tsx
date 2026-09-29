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
    Loader2,
} from "lucide-react";
import api from "../../lib/axios";
import StatCard from "../../components/pageComponents/admin/statCard";
import { formatPrice, formatShortDate } from "../../utils/formatters";
import type { DashboardStats, RevenueSummary } from "../../types/dashboard";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type RangePreset = "today" | "week" | "month" | "year" | "custom";

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
    { value: "custom", label: "Custom" },
];

function toDateInputValue(date: Date) {
    return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Computes the [from, to] window for a preset. Custom returns null until
// the person has picked both ends of the range.
function computeRange(
    preset: RangePreset,
    customFrom: string,
    customTo: string,
): { from: Date; to: Date } | null {
    const now = new Date();

    if (preset === "today") {
        const from = new Date(now);
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
    }
    if (preset === "week") {
        const day = now.getDay(); // 0 = Sunday
        const diffToMonday = day === 0 ? 6 : day - 1;
        const from = new Date(now);
        from.setDate(now.getDate() - diffToMonday);
        from.setHours(0, 0, 0, 0);
        return { from, to: now };
    }
    if (preset === "month") {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from, to: now };
    }
    if (preset === "year") {
        const from = new Date(now.getFullYear(), 0, 1);
        return { from, to: now };
    }
    // custom
    if (!customFrom || !customTo) return null;
    const from = new Date(`${customFrom}T00:00:00`);
    const to = new Date(`${customTo}T23:59:59`);
    return { from, to };
}

interface RangeFilterProps {
    preset: RangePreset;
    onPresetChange: (p: RangePreset) => void;
    customFrom: string;
    customTo: string;
    onCustomChange: (from: string, to: string) => void;
}

function RevenueRangeFilter({
    preset,
    onPresetChange,
    customFrom,
    customTo,
    onCustomChange,
}: RangeFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-white p-1">
                {RANGE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onPresetChange(opt.value)}
                        className={`rounded-[4px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            preset === opt.value
                                ? "bg-crate text-white"
                                : "text-ink/60 hover:text-ink"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            {preset === "custom" && (
                <div className="flex items-center gap-1.5">
                    <input
                        type="date"
                        value={customFrom}
                        max={customTo || undefined}
                        onChange={(e) =>
                            onCustomChange(e.target.value, customTo)
                        }
                        className="rounded-md border-2 border-ink/20 bg-white px-2 py-1.5 text-xs text-ink outline-none transition focus:border-crate"
                    />
                    <span className="text-xs text-ink/40">to</span>
                    <input
                        type="date"
                        value={customTo}
                        min={customFrom || undefined}
                        onChange={(e) =>
                            onCustomChange(customFrom, e.target.value)
                        }
                        className="rounded-md border-2 border-ink/20 bg-white px-2 py-1.5 text-xs text-ink outline-none transition focus:border-crate"
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

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [preset, setPreset] = useState<RangePreset>("month");
    const [customFrom, setCustomFrom] = useState(
        toDateInputValue(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
    );
    const [customTo, setCustomTo] = useState(toDateInputValue(new Date()));
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
        if (!range) return;
        setSummaryLoading(true);
        setSummaryError(null);
        api.get("/dashboard/revenue-summary", {
            params: {
                from: range.from.toISOString(),
                to: range.to.toISOString(),
            },
        })
            .then(({ data }) => setSummary(data))
            .catch((err) =>
                setSummaryError(
                    getErrorMessage(err, "Couldn't load this date range."),
                ),
            )
            .finally(() => setSummaryLoading(false));
    }, [range]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error ?? "Something went wrong."}
            </div>
        );
    }

    const trendData = stats.revenueTrend.map((d) => ({
        ...d,
        label: formatShortDate(d.date),
    }));

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

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-kraft/40 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
                    Date range for revenue &amp; top products
                </p>
                <RevenueRangeFilter
                    preset={preset}
                    onPresetChange={setPreset}
                    customFrom={customFrom}
                    customTo={customTo}
                    onCustomChange={(from, to) => {
                        setCustomFrom(from);
                        setCustomTo(to);
                    }}
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
                    value={
                        summaryLoading && !summary
                            ? "…"
                            : formatPrice(summary?.revenue.total ?? 0)
                    }
                    icon={Wallet}
                    accent="crate"
                    footnote={`${summary?.revenue.totalOrders ?? 0} completed orders`}
                />
                <StatCard
                    label="Orders (all time)"
                    value={String(
                        stats.ordersByStatus.reduce((s, o) => s + o.count, 0),
                    )}
                    icon={ShoppingCart}
                    accent="signal"
                    footnote={`${
                        stats.ordersByStatus.find((o) => o.status === "pending")
                            ?.count ?? 0
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
                    label="Products"
                    value={String(stats.products.total)}
                    icon={Package}
                    accent="crate"
                    footnote={`${stats.products.totalCategories} categories`}
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
                        Revenue — last 14 days
                    </h2>
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
                        {summaryLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-ink/30" />
                        )}
                    </div>
                    {!summary || summary.topProducts.length === 0 ? (
                        <p className="mt-4 text-sm text-ink/50">
                            {summaryLoading
                                ? "Loading…"
                                : "No sales in this date range."}
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
