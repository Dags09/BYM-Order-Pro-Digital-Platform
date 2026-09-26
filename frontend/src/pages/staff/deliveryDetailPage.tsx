import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Phone,
    Mail,
    Package,
    Loader2,
    CheckCircle2,
    Truck,
    Radio,
} from "lucide-react";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore";
import { useLiveLocation } from "../../hooks/useLiveLocation";
import DestinationMap from "../../components/pageComponents/staff/destinationMap";
import type { Order } from "../../types/order";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function DeliveryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const {
        sharing,
        error: locationError,
        lastSentAt,
        toggle,
    } = useLiveLocation(id ?? "");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        api.get(`/order/get-order-by-id/${id}`)
            .then(({ data }: { data: Order }) => {
                if (data.driver?._id !== user?._id) {
                    setError("This delivery isn't assigned to you.");
                    return;
                }
                setOrder(data);
            })
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load this delivery.")),
            )
            .finally(() => setLoading(false));
    }, [id, user?._id]);

    const handleAdvanceStatus = async (status: "shipped" | "delivered") => {
        if (!id) return;
        setUpdating(true);
        setActionError(null);
        try {
            const { data } = await api.put(
                `/driver/update-delivery-status/${id}`,
                { status },
            );
            setOrder(data);
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Couldn't update this delivery."),
            );
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
            <div className="space-y-4">
                <button
                    onClick={() => navigate("/staff")}
                    className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                    Back to deliveries
                </button>
                <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                    {error ?? "Delivery not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10">
            <button
                onClick={() => navigate("/staff")}
                className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Back to deliveries
            </button>

            {/* Header */}
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
                <p className="mt-2 text-sm text-ink/60">
                    {order.scheduledDeliveryDate
                        ? `Scheduled ${formatDateTime(order.scheduledDeliveryDate)}`
                        : `Placed ${formatDateTime(order.createdAt)}`}
                </p>

                {order.note && (
                    <div className="mt-3 rounded-md bg-kraft px-3 py-2 text-sm text-ink/70">
                        <span className="font-medium">Note: </span>
                        {order.note}
                    </div>
                )}

                {actionError && (
                    <p className="mt-3 text-sm text-route">{actionError}</p>
                )}

                {order.status === "processing" && (
                    <button
                        onClick={() => handleAdvanceStatus("shipped")}
                        disabled={updating}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-crate py-2.5 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-50"
                    >
                        {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Truck className="h-4 w-4" strokeWidth={1.75} />
                        )}
                        Start delivery
                    </button>
                )}

                {order.status === "shipped" && (
                    <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                        <div className="flex items-center justify-between gap-3 rounded-md bg-kraft/50 px-3 py-2.5">
                            <div className="min-w-0">
                                <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                                    <Radio
                                        className={`h-4 w-4 ${sharing ? "text-crate" : "text-ink/40"}`}
                                        strokeWidth={1.75}
                                    />
                                    Share live location
                                </p>
                                <p className="text-xs text-ink/50">
                                    {sharing
                                        ? lastSentAt
                                            ? `Sharing · last sent ${lastSentAt.toLocaleTimeString(
                                                  "en-PH",
                                                  {
                                                      hour: "numeric",
                                                      minute: "2-digit",
                                                  },
                                              )}`
                                            : "Sharing · waiting for GPS…"
                                        : "Off — the customer won't see your location"}
                                </p>
                                {locationError && (
                                    <p className="mt-1 text-xs text-route">
                                        {locationError}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={toggle}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                    sharing
                                        ? "bg-route/10 text-route hover:bg-route/15"
                                        : "bg-crate text-white hover:bg-crate-dark"
                                }`}
                            >
                                {sharing ? "Stop sharing" : "Start sharing"}
                            </button>
                        </div>

                        <button
                            onClick={() => handleAdvanceStatus("delivered")}
                            disabled={updating}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-crate py-2.5 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-50"
                        >
                            {updating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2
                                    className="h-4 w-4"
                                    strokeWidth={1.75}
                                />
                            )}
                            Mark as delivered
                        </button>
                    </div>
                )}

                {order.status === "delivered" && (
                    <div className="mt-4 flex items-center gap-2 rounded-md bg-crate/10 px-3 py-2.5 text-sm font-medium text-crate">
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                        Delivered {formatDateTime(order.updatedAt)}
                    </div>
                )}

                {order.status === "cancelled" && (
                    <div className="mt-4 rounded-md bg-route/10 px-3 py-2.5 text-sm font-medium text-route">
                        This order was cancelled.
                    </div>
                )}
            </div>

            {/* Customer */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Customer
                </p>
                <p className="mt-2 text-sm font-medium text-ink">
                    {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Deleted customer"}
                </p>
                <div className="mt-2 space-y-2 text-sm text-ink/70">
                    {order.customer?.phoneNumber && (
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
                    {order.customer?.email && (
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
                    )}
                </div>
            </div>

            {/* Destination */}
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
                                    {item.product?.name ?? "Removed product"}
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
                <p className="mt-1 flex items-center gap-1 text-xs uppercase tracking-wide text-ink/40">
                    <Package className="h-3 w-3" />
                    {order.paymentMethod} · {order.paymentStatus}
                </p>
            </div>
        </div>
    );
}
