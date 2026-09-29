import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Truck } from "lucide-react";
import api from "../../lib/axios";
import type { Order, OrderStatus } from "../../types/order";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type FilterTab = "all" | OrderStatus;

const TABS: FilterTab[] = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function AdminOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/order/get-all-orders")
            .then(({ data }) => setOrders(data))
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load orders.")),
            )
            .finally(() => setLoading(false));
    }, []);

    const countFor = (t: FilterTab) =>
        t === "all"
            ? orders.length
            : orders.filter((o) => o.status === t).length;

    const filtered = orders
        .filter((o) => tab === "all" || o.status === tab)
        .filter((o) => {
            if (!search.trim()) return true;
            const q = search.trim().toLowerCase();
            const name = o.customer
                ? `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase()
                : "";
            return name.includes(q) || o._id.toLowerCase().includes(q);
        })
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );

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
                    Orders
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Platform-wide order oversight. Status changes and driver
                    assignment are handled by managers.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-white p-1">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`rounded-[4px] px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                                tab === t
                                    ? "bg-crate text-white"
                                    : "text-ink/60 hover:text-ink"
                            }`}
                        >
                            {t === "all" ? "All" : STATUS_LABELS[t]}
                            <span
                                className={`ml-1.5 text-xs ${tab === t ? "text-white/70" : "text-ink/40"}`}
                            >
                                {countFor(t)}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
                        strokeWidth={1.75}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search customer or order ID"
                        className="w-full rounded-md border-2 border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate sm:w-72"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                {filtered.length === 0 ? (
                    <div className="p-10 text-center text-sm text-ink/50">
                        No orders match this filter.
                    </div>
                ) : (
                    <div className="divide-y divide-ink/5">
                        {filtered.map((order) => (
                            <button
                                key={order._id}
                                onClick={() =>
                                    navigate(`/admin/orders/${order._id}`)
                                }
                                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-kraft/30"
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
                                            {formatDateTime(order.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-ink/70">
                                        {order.customer
                                            ? `${order.customer.firstName} ${order.customer.lastName}`
                                            : "Deleted customer"}{" "}
                                        · {order.shippingAddress.city}
                                        {order.driver && (
                                            <>
                                                {" "}
                                                <span className="text-ink/40">
                                                    · driver{" "}
                                                    {order.driver.firstName}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    {!order.driver &&
                                        order.status !== "cancelled" && (
                                            <Truck
                                                className="h-3.5 w-3.5 text-signal-dark"
                                                strokeWidth={1.75}
                                            />
                                        )}
                                    <span className="text-sm font-medium text-ink/80">
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
