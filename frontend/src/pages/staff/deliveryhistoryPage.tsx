import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, ChevronRight, Search, Package } from "lucide-react";
import api from "../../lib/axios";
import type { Order, OrderStatus } from "../../types/order";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type FilterTab = "all" | Extract<OrderStatus, "delivered" | "cancelled">;

const TABS: FilterTab[] = ["all", "delivered", "cancelled"];

// Once an order leaves these two statuses it's done — this is what
// separates "history" from the active list on the deliveries page.
const HISTORY_STATUSES = ["delivered", "cancelled"];

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function DeliveryHistoryPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/driver/my-deliveries")
            .then(({ data }) => setOrders(data))
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load your history.")),
            )
            .finally(() => setLoading(false));
    }, []);

    const history = orders
        .filter((o) => HISTORY_STATUSES.includes(o.status))
        .sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
        );

    const countFor = (t: FilterTab) =>
        t === "all"
            ? history.length
            : history.filter((o) => o.status === t).length;

    const filtered = history
        .filter((o) => tab === "all" || o.status === tab)
        .filter((o) => {
            if (!search.trim()) return true;
            const q = search.trim().toLowerCase();
            const name = o.customer
                ? `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase()
                : "";
            return name.includes(q) || o._id.toLowerCase().includes(q);
        });

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10">
            <div>
                <p className="font-display text-xl font-semibold text-ink">
                    Delivery history
                </p>
                <p className="text-sm text-ink/50">
                    Everything you've delivered or that's been cancelled.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {error}
                </div>
            )}

            <div className="rounded-lg border border-ink/10 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-kraft/30 p-1">
                        {TABS.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`rounded-[4px] px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                                    tab === t
                                        ? "bg-crate text-white"
                                        : "text-ink/60 hover:text-ink"
                                }`}
                            >
                                {t === "all" ? "All" : STATUS_LABELS[t]}
                                <span
                                    className={`ml-1 ${tab === t ? "text-white/70" : "text-ink/40"}`}
                                >
                                    {countFor(t)}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30"
                            strokeWidth={1.75}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order or customer"
                            className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 py-1.5 pl-8 pr-3 text-xs text-ink outline-none transition focus:border-crate sm:w-52"
                        />
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="p-10 text-center">
                        <History
                            className="mx-auto h-8 w-8 text-ink/20"
                            strokeWidth={1.5}
                        />
                        <p className="mt-3 text-sm text-ink/50">
                            No completed deliveries yet.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-ink/50">
                            No deliveries match this filter.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-ink/5">
                        {filtered.map((order) => (
                            <button
                                key={order._id}
                                onClick={() => navigate(`/staff/${order._id}`)}
                                className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-kraft/30"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                                            style={{
                                                backgroundColor:
                                                    STATUS_COLORS[order.status],
                                            }}
                                        >
                                            {STATUS_LABELS[order.status]}
                                        </span>
                                        <span className="font-mono text-xs text-ink/40">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <span className="text-xs text-ink/40">
                                            {formatDateTime(order.updatedAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-ink/70">
                                        {order.customer
                                            ? `${order.customer.firstName} ${order.customer.lastName}`
                                            : "Deleted customer"}{" "}
                                        · {order.shippingAddress.city}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="flex items-center gap-1 text-sm font-medium text-ink/80">
                                        <Package className="h-3.5 w-3.5 text-ink/40" />
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-ink/30" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
