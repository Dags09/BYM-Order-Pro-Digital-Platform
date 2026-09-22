import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Truck,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import api from "../../lib/axios";
import type { Order, OrderStatus } from "../../types/order";
import { formatPrice, formatDateTime } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

interface DriverOption {
    _id: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    emailVerified: boolean;
    activeDeliveries: number;
}

const STATUS_OPTIONS: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

// These statuses only make sense once a driver is on the order —
// mirrors the guard in the backend's updateOrderStatus.
const DRIVER_REQUIRED_STATUSES: OrderStatus[] = [
    "processing",
    "shipped",
    "delivered",
];

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function ManagerOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
    const [updating, setUpdating] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const [drivers, setDrivers] = useState<DriverOption[]>([]);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        api.get(`/order/get-order-by-id/${id}`)
            .then(({ data }) => {
                setOrder(data);
                setNextStatus(data.status);
            })
            .catch(() => setError("Couldn't load this order."))
            .finally(() => setLoading(false));

        api.get("/driver/list-drivers")
            .then(({ data }) => setDrivers(data))
            .catch(() => {
                // Non-fatal — the order itself still loads; the assign
                // form will just show an empty driver list.
            });
    }, [id]);

    const handleAssignDriver = async () => {
        if (!id || !selectedDriverId || !scheduledAt) return;
        setAssigning(true);
        setAssignError(null);
        try {
            const { data } = await api.put(`/driver/assign-driver/${id}`, {
                driverId: selectedDriverId,
                scheduledDeliveryDate: new Date(scheduledAt).toISOString(),
            });
            setOrder(data);
            setNextStatus(data.status);
            setShowAssignForm(false);
            setSelectedDriverId("");
            setScheduledAt("");
        } catch (err) {
            setAssignError(
                getErrorMessage(err, "Couldn't assign this driver."),
            );
        } finally {
            setAssigning(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!id || !nextStatus || nextStatus === order?.status) return;
        setUpdating(true);
        setActionError(null);
        setSaved(false);
        try {
            const { data } = await api.put(`/order/update-order-status/${id}`, {
                status: nextStatus,
            });
            setOrder(data);
            setSaved(true);
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Couldn't update the order status."),
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
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error ?? "Order not found."}
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10">
            <button
                onClick={() => navigate("/manager/orders")}
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

                {/* Status control */}
                <div className="mt-4 flex flex-col gap-2 border-t border-ink/10 pt-4 sm:flex-row sm:items-center">
                    <select
                        value={nextStatus}
                        onChange={(e) =>
                            setNextStatus(e.target.value as OrderStatus)
                        }
                        className="rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                    >
                        {STATUS_OPTIONS.map((s) => {
                            const disabled =
                                !order.driver &&
                                DRIVER_REQUIRED_STATUSES.includes(s);
                            return (
                                <option key={s} value={s} disabled={disabled}>
                                    {STATUS_LABELS[s]}
                                    {disabled ? " (needs a driver)" : ""}
                                </option>
                            );
                        })}
                    </select>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={updating || nextStatus === order.status}
                        className="rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-50"
                    >
                        {updating ? "Updating…" : "Update status"}
                    </button>
                    {saved && (
                        <span className="flex items-center gap-1 text-sm text-crate">
                            <CheckCircle2
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                            Saved
                        </span>
                    )}
                </div>
                {!order.driver && (
                    <p className="mt-2 text-xs text-ink/50">
                        Assign a driver before moving this order past pending.
                    </p>
                )}
                {actionError && (
                    <p className="mt-2 text-sm text-route">{actionError}</p>
                )}
            </div>

            {/* Customer & address */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Customer
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                    {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : "Deleted customer"}
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

                {order.note && (
                    <div className="mt-4 rounded-md bg-kraft px-3 py-2 text-sm text-ink/70">
                        <span className="font-medium">Note: </span>
                        {order.note}
                    </div>
                )}
            </div>

            {/* Driver */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                        Driver
                    </p>
                    {!showAssignForm && (
                        <button
                            onClick={() => {
                                setShowAssignForm(true);
                                setSelectedDriverId(order.driver?._id ?? "");
                                setAssignError(null);
                            }}
                            className="text-xs font-medium text-crate hover:underline"
                        >
                            {order.driver ? "Reassign" : "Assign driver"}
                        </button>
                    )}
                </div>

                {order.driver && !showAssignForm ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-ink">
                        <Truck
                            className="h-4 w-4 text-ink/40"
                            strokeWidth={1.75}
                        />
                        {order.driver.firstName} {order.driver.lastName}
                    </div>
                ) : !showAssignForm ? (
                    <p className="mt-2 text-sm text-ink/50">
                        No driver assigned yet.
                    </p>
                ) : null}

                {showAssignForm && (
                    <div className="mt-3 space-y-3 border-t border-ink/10 pt-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink">
                                Driver
                            </label>
                            <select
                                value={selectedDriverId}
                                onChange={(e) =>
                                    setSelectedDriverId(e.target.value)
                                }
                                className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                            >
                                <option value="" disabled>
                                    {drivers.length === 0
                                        ? "No drivers available"
                                        : "Select a driver"}
                                </option>
                                {drivers.map((d) => {
                                    const unavailable =
                                        !d.isActive || !d.emailVerified;
                                    return (
                                        <option
                                            key={d._id}
                                            value={d._id}
                                            disabled={unavailable}
                                        >
                                            {d.firstName} {d.lastName}
                                            {!d.isActive
                                                ? " (disabled)"
                                                : !d.emailVerified
                                                  ? " (unverified)"
                                                  : ` — ${d.activeDeliveries} active`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink">
                                Scheduled delivery
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                min={new Date().toISOString().slice(0, 16)}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate sm:w-auto"
                            />
                        </div>
                        {assignError && (
                            <p className="text-sm text-route">{assignError}</p>
                        )}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAssignDriver}
                                disabled={
                                    assigning ||
                                    !selectedDriverId ||
                                    !scheduledAt
                                }
                                className="flex items-center gap-2 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-50"
                            >
                                {assigning && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowAssignForm(false);
                                    setAssignError(null);
                                }}
                                className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
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
                <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">
                    {order.paymentMethod} · {order.paymentStatus}
                </p>
            </div>
        </div>
    );
}
