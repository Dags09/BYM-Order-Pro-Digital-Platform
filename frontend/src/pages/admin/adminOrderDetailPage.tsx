import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Truck, Package } from "lucide-react";
import api from "../../lib/axios";
import type { Order } from "../../types/order";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function AdminOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        api.get(`/order/get-order-by-id/${id}`)
            .then(({ data }) => setOrder(data))
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load this order.")),
            )
            .finally(() => setLoading(false));
    }, [id]);

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
                    onClick={() => navigate("/admin/orders")}
                    className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                    Back to orders
                </button>
                <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                    {error ?? "Order not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10">
            <button
                onClick={() => navigate("/admin/orders")}
                className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Back to orders
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
                <p className="mt-2 text-sm text-ink/60">
                    Placed {formatDateTime(order.createdAt)}
                    {order.scheduledDeliveryDate && (
                        <>
                            {" "}
                            · Scheduled{" "}
                            {formatDateTime(order.scheduledDeliveryDate)}
                        </>
                    )}
                </p>

                {order.note && (
                    <div className="mt-3 rounded-md bg-kraft px-3 py-2 text-sm text-ink/70">
                        <span className="font-medium">Note: </span>
                        {order.note}
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
                            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.75} />
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
                <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/60">
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                    , {order.shippingAddress.province}{" "}
                    {order.shippingAddress.zipCode}
                </p>
            </div>

            {/* Driver */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Driver
                </p>
                {order.driver ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-ink">
                        <Truck className="h-4 w-4 text-ink/40" strokeWidth={1.75} />
                        {order.driver.firstName} {order.driver.lastName}
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-ink/50">
                        No driver assigned yet.
                    </p>
                )}
            </div>

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