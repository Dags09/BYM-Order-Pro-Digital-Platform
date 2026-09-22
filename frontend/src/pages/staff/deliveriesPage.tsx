import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, ChevronRight, CalendarClock } from "lucide-react";
import api from "../../lib/axios";
import socket from "../../lib/socket";
import type { Order } from "../../types/order";
import { formatPrice, formatDateTime, isSameDay } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type FilterTab = "today" | "all";

export default function DeliveriesPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<FilterTab>("today");

    const fetchDeliveries = useCallback(() => {
        setLoading(true);
        api.get("/order/my-deliveries")
            .then(({ data }) => setOrders(data))
            .catch(() => setError("Couldn't load your deliveries."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    // Refresh the list whenever admin assigns us a new delivery
    useEffect(() => {
        const handleAssigned = () => fetchDeliveries();
        socket.on("order:assigned", handleAssigned);
        return () => {
            socket.off("order:assigned", handleAssigned);
        };
    }, [fetchDeliveries]);

    const activeOrders = orders.filter((o) =>
        ["processing", "shipped"].includes(o.status),
    );

    const filtered = activeOrders.filter((o) => {
        if (tab === "all") return true;
        if (!o.scheduledDeliveryDate) return false;
        return isSameDay(o.scheduledDeliveryDate);
    });

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
                    My deliveries
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Orders assigned to you for delivery.
                </p>
            </div>

            <div className="flex gap-1 rounded-md border border-ink/10 bg-white p-1">
                {(["today", "all"] as FilterTab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-[4px] py-2 text-sm font-medium capitalize transition-colors ${
                            tab === t
                                ? "bg-crate text-white"
                                : "text-ink/60 hover:text-ink"
                        }`}
                    >
                        {t === "today" ? "Today" : "All active"}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/50 p-10 text-center">
                    <Package
                        className="mx-auto h-8 w-8 text-ink/30"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/60">
                        {tab === "today"
                            ? "No deliveries scheduled for today."
                            : "No active deliveries assigned to you right now."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order) => (
                        <button
                            key={order._id}
                            onClick={() => navigate(`/staff/${order._id}`)}
                            className="flex w-full items-center justify-between rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
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
                                </div>

                                <p className="mt-2 truncate font-medium text-ink">
                                    {order.customer.firstName}{" "}
                                    {order.customer.lastName}
                                </p>

                                <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink/60">
                                    <MapPin
                                        className="h-3.5 w-3.5 shrink-0"
                                        strokeWidth={1.75}
                                    />
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.province}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                                    {order.scheduledDeliveryDate && (
                                        <span className="flex items-center gap-1">
                                            <CalendarClock
                                                className="h-3.5 w-3.5"
                                                strokeWidth={1.75}
                                            />
                                            {formatDateTime(
                                                order.scheduledDeliveryDate,
                                            )}
                                        </span>
                                    )}
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
