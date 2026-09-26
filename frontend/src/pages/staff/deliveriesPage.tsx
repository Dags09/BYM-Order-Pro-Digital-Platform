import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Truck,
    ChevronRight,
    MapPin,
    Package,
    CalendarClock,
} from "lucide-react";
import api from "../../lib/axios";
import socket from "../../lib/socket";
import type { Order } from "../../types/order";
import { formatDateTime, formatPrice, isSameDay } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

// Statuses a driver is actively working on. Once an order lands in
// "delivered" or "cancelled" it belongs on the history page instead.
const ACTIVE_STATUSES = ["processing", "shipped"];

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function DeliveriesPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDeliveries = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get("/driver/my-deliveries")
            .then(({ data }) => setOrders(data))
            .catch((err) =>
                setError(
                    getErrorMessage(err, "Couldn't load your deliveries."),
                ),
            )
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    // A manager assigning a new order pushes "order:assigned" to this
    // driver's room (see staffLayout, which joins it) — refresh the list
    // live instead of making the driver pull to refresh.
    useEffect(() => {
        socket.on("order:assigned", fetchDeliveries);
        return () => {
            socket.off("order:assigned", fetchDeliveries);
        };
    }, [fetchDeliveries]);

    const active = orders
        .filter((o) => ACTIVE_STATUSES.includes(o.status))
        .sort((a, b) => {
            const aDate = a.scheduledDeliveryDate
                ? new Date(a.scheduledDeliveryDate).getTime()
                : Infinity;
            const bDate = b.scheduledDeliveryDate
                ? new Date(b.scheduledDeliveryDate).getTime()
                : Infinity;
            return aDate - bDate;
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
                    My deliveries
                </p>
                <p className="text-sm text-ink/50">
                    {active.length === 0
                        ? "Nothing assigned to you right now."
                        : `${active.length} ${active.length === 1 ? "delivery" : "deliveries"} in progress`}
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {error}
                </div>
            )}

            {active.length === 0 && !error ? (
                <div className="rounded-lg border border-ink/10 bg-white p-10 text-center shadow-sm">
                    <Truck
                        className="mx-auto h-8 w-8 text-ink/20"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/50">
                        You'll see new deliveries here as soon as they're
                        assigned to you.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-ink/5 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                    {active.map((order) => {
                        const scheduledToday =
                            order.scheduledDeliveryDate &&
                            isSameDay(order.scheduledDeliveryDate);
                        return (
                            <button
                                key={order._id}
                                onClick={() => navigate(`/staff/${order._id}`)}
                                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-kraft/30"
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
                                        {order.scheduledDeliveryDate && (
                                            <span
                                                className={`flex items-center gap-1 text-xs ${
                                                    scheduledToday
                                                        ? "font-medium text-crate"
                                                        : "text-ink/40"
                                                }`}
                                            >
                                                <CalendarClock className="h-3 w-3" />
                                                {scheduledToday
                                                    ? "Today"
                                                    : formatDateTime(
                                                          order.scheduledDeliveryDate,
                                                      )}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1.5 truncate text-sm font-medium text-ink">
                                        {order.customer
                                            ? `${order.customer.firstName} ${order.customer.lastName}`
                                            : "Deleted customer"}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink/50">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        {order.shippingAddress.street},{" "}
                                        {order.shippingAddress.city}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="flex items-center gap-1 text-sm font-medium text-ink/80">
                                        <Package className="h-3.5 w-3.5 text-ink/40" />
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-ink/40">
                                        {order.items.length}{" "}
                                        {order.items.length === 1
                                            ? "item"
                                            : "items"}
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
