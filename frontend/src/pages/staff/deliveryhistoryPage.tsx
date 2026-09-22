import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle2,
    ChevronRight,
    PackageSearch,
    CalendarRange,
    X,
} from "lucide-react";
import api from "../../lib/axios";
import type { Order } from "../../types/order";
import { formatPrice, formatDateTime } from "../../utils/formatters";

function toDateInputValue(d: Date) {
    return d.toISOString().slice(0, 10);
}

function startOfDay(dateStr: string) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(dateStr: string) {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d;
}

type Preset = "today" | "week" | "month" | "all" | "custom";

export default function DeliveryHistoryPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [preset, setPreset] = useState<Preset>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        api.get("/order/my-deliveries")
            .then(({ data }) => setOrders(data))
            .catch(() => setError("Couldn't load your delivery history."))
            .finally(() => setLoading(false));
    }, []);

    const applyPreset = (p: Preset) => {
        setPreset(p);
        const now = new Date();
        if (p === "today") {
            const today = toDateInputValue(now);
            setFromDate(today);
            setToDate(today);
        } else if (p === "week") {
            const start = new Date(now);
            start.setDate(now.getDate() - 6);
            setFromDate(toDateInputValue(start));
            setToDate(toDateInputValue(now));
        } else if (p === "month") {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            setFromDate(toDateInputValue(start));
            setToDate(toDateInputValue(now));
        } else if (p === "all") {
            setFromDate("");
            setToDate("");
        } else if (p === "custom") {
            setFromDate("");
            setToDate("");
        }
    };

    const completed = useMemo(
        () =>
            orders
                .filter((o) => o.status === "delivered")
                .filter((o) => {
                    if (!fromDate && !toDate) return true;
                    const deliveredAt = new Date(o.updatedAt);
                    if (fromDate && deliveredAt < startOfDay(fromDate))
                        return false;
                    if (toDate && deliveredAt > endOfDay(toDate)) return false;
                    return true;
                })
                .sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime(),
                ),
        [orders, fromDate, toDate],
    );

    const hasActiveFilter = !!(fromDate || toDate);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Delivery history
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    {completed.length} completed{" "}
                    {completed.length === 1 ? "delivery" : "deliveries"}
                </p>
            </div>

            {/* Date filter */}
            <div className="rounded-lg border border-ink/10 bg-white p-4">
                <div className="flex flex-wrap gap-1.5">
                    {(
                        [
                            ["today", "Today"],
                            ["week", "Last 7 days"],
                            ["month", "This month"],
                            ["all", "All time"],
                            ["custom", "Custom"],
                        ] as [Preset, string][]
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => applyPreset(key)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                preset === key
                                    ? "bg-crate text-white"
                                    : "bg-kraft text-ink/60 hover:text-ink"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {preset === "custom" && (
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                                From
                            </span>
                            <input
                                type="date"
                                value={fromDate}
                                max={toDate || undefined}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="rounded-md border-2 border-ink/20 bg-kraft/40 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-crate"
                            />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
                                To
                            </span>
                            <input
                                type="date"
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={(e) => setToDate(e.target.value)}
                                className="rounded-md border-2 border-ink/20 bg-kraft/40 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-crate"
                            />
                        </label>

                        {hasActiveFilter && (
                            <button
                                onClick={() => applyPreset("all")}
                                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink/50 hover:text-route"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {completed.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/50 p-10 text-center">
                    {hasActiveFilter ? (
                        <>
                            <CalendarRange
                                className="mx-auto h-8 w-8 text-ink/30"
                                strokeWidth={1.5}
                            />
                            <p className="mt-3 text-sm text-ink/60">
                                No deliveries in this date range.
                            </p>
                        </>
                    ) : (
                        <>
                            <PackageSearch
                                className="mx-auto h-8 w-8 text-ink/30"
                                strokeWidth={1.5}
                            />
                            <p className="mt-3 text-sm text-ink/60">
                                No completed deliveries yet.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {completed.map((order) => (
                        <button
                            key={order._id}
                            onClick={() => navigate(`/staff/${order._id}`)}
                            className="flex w-full items-center justify-between rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 rounded-full bg-crate/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-crate">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Delivered
                                    </span>
                                    <span className="font-mono text-xs text-ink/40">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>

                                <p className="mt-2 truncate font-medium text-ink">
                                    {order.customer.firstName}{" "}
                                    {order.customer.lastName}
                                </p>

                                <p className="mt-0.5 truncate text-sm text-ink/60">
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.province}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                                    <span>
                                        Delivered{" "}
                                        {formatDateTime(order.updatedAt)}
                                    </span>
                                    <span>{order.items.length} item(s)</span>
                                    <span className="font-medium text-ink/70">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-ink/30" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
