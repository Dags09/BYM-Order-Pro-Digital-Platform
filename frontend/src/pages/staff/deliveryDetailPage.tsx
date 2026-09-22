import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Navigation,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import api from "../../lib/axios";
import type { Order } from "../../types/order";
import { formatPrice, formatDateTime } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import DestinationMap from "../../components/pageComponents/staff/destinationMap";

export default function DeliveryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const liveLocation = useLiveLocation(id ?? "");

    useEffect(() => {
        if (!id) return;
        api.get(`/order/get-order-by-id/${id}`)
            .then(({ data }) => setOrder(data))
            .catch(() => setError("Couldn't load this delivery."))
            .finally(() => setLoading(false));
    }, [id]);

    const advanceStatus = async (nextStatus: "shipped" | "delivered") => {
        if (!id) return;
        setUpdating(true);
        setActionError(null);
        try {
            const { data } = await api.put(
                `/order/update-delivery-status/${id}`,
                { status: nextStatus },
            );
            setOrder(data);
        } catch (err) {
            const message =
                (err as { response?: { data?: { message?: string } } }).response
                    ?.data?.message ?? "Couldn't update the status.";
            setActionError(message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error ?? "Delivery not found."}
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-24">
            <button
                onClick={() => navigate("/staff")}
                className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Back to deliveries
            </button>

            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-ink/40">
                        Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                        style={{ backgroundColor: STATUS_COLORS[order.status] }}
                    >
                        {STATUS_LABELS[order.status]}
                    </span>
                </div>

                {order.scheduledDeliveryDate && (
                    <p className="mt-2 text-sm text-ink/60">
                        Scheduled for{" "}
                        <span className="font-medium text-ink">
                            {formatDateTime(order.scheduledDeliveryDate)}
                        </span>
                    </p>
                )}
            </div>

            {/* Customer & address */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Deliver to
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                    {order.customer.firstName} {order.customer.lastName}
                </p>

                <div className="mt-3 space-y-2 text-sm text-ink/70">
                    <p className="flex items-start gap-2">
                        <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-ink/40"
                            strokeWidth={1.75}
                        />
                        {order.shippingAddress.street},{" "}
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.province}{" "}
                        {order.shippingAddress.zipCode}
                    </p>
                    {order.customer.phoneNumber && (
                        <a
                            href={`tel:${order.customer.phoneNumber}`}
                            className="flex items-center gap-2 text-crate hover:underline"
                        >
                            <Phone
                                className="h-4 w-4 shrink-0"
                                strokeWidth={1.75}
                            />
                            {order.customer.phoneNumber}
                        </a>
                    )}
                    <a
                        href={`mailto:${order.customer.email}`}
                        className="flex items-center gap-2 hover:underline"
                    >
                        <Mail
                            className="h-4 w-4 shrink-0 text-ink/40"
                            strokeWidth={1.75}
                        />
                        {order.customer.email}
                    </a>
                </div>

                {order.note && (
                    <div className="mt-4 rounded-md bg-kraft px-3 py-2 text-sm text-ink/70">
                        <span className="font-medium">Note: </span>
                        {order.note}
                    </div>
                )}
            </div>

            <DestinationMap address={order.shippingAddress} />

            {/* Items */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Items ({order.items.length})
                </p>
                <div className="mt-3 divide-y divide-ink/5">
                    {order.items.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-2.5 text-sm"
                        >
                            <div>
                                <p className="font-medium text-ink">
                                    {item.product.name}
                                </p>
                                <p className="text-ink/50">
                                    {item.quantity} × {formatPrice(item.price)}
                                </p>
                            </div>
                            <p className="font-medium text-ink">
                                {formatPrice(item.quantity * item.price)}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                    <span className="font-medium text-ink">Total</span>
                    <span className="font-display text-lg font-semibold text-ink">
                        {formatPrice(order.totalAmount)}
                    </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">
                    {order.paymentMethod} · {order.paymentStatus}
                </p>
            </div>

            {/* Live location sharing (only while out for delivery) */}
            {order.status === "shipped" && (
                <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                                Live location
                            </p>
                            <p className="mt-1 text-sm text-ink/60">
                                {liveLocation.sharing
                                    ? "Sharing your location with the customer."
                                    : "Share your location so the customer can track you."}
                            </p>
                        </div>
                        <button
                            onClick={liveLocation.toggle}
                            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                liveLocation.sharing
                                    ? "bg-route text-white hover:bg-route/90"
                                    : "bg-crate text-white hover:bg-crate-dark"
                            }`}
                        >
                            <Navigation
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                            {liveLocation.sharing
                                ? "Stop sharing"
                                : "Start sharing"}
                        </button>
                    </div>
                    {liveLocation.error && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-route">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {liveLocation.error}
                        </p>
                    )}
                    {liveLocation.sharing && liveLocation.lastSentAt && (
                        <p className="mt-2 text-xs text-ink/40">
                            Last sent{" "}
                            {liveLocation.lastSentAt.toLocaleTimeString(
                                "en-PH",
                            )}
                        </p>
                    )}
                </div>
            )}

            {actionError && (
                <div className="rounded-md border border-route/20 bg-route/5 p-3 text-sm text-route">
                    {actionError}
                </div>
            )}

            {/* Sticky action bar */}
            {order.status === "processing" && (
                <div className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-white p-4">
                    <button
                        onClick={() => advanceStatus("shipped")}
                        disabled={updating}
                        className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-md bg-crate py-3 font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-60"
                    >
                        {updating
                            ? "Updating…"
                            : "Start delivery (mark as shipped)"}
                    </button>
                </div>
            )}
            {order.status === "shipped" && (
                <div className="fixed inset-x-0 bottom-0 border-t border-ink/10 bg-white p-4">
                    <button
                        onClick={() => advanceStatus("delivered")}
                        disabled={updating}
                        className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-md bg-crate py-3 font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-60"
                    >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                        {updating ? "Updating…" : "Mark as delivered"}
                    </button>
                </div>
            )}
            {order.status === "delivered" && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-crate/20 bg-crate/5 p-4 text-crate">
                    <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
                    <span className="font-medium">Delivery completed</span>
                </div>
            )}
        </div>
    );
}
