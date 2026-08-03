import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faTruck,
    faSpinner,
    faBoxOpen,
    faClockRotateLeft,
    faLocationDot,
    faPhone,
    faEnvelope,
    faUser,
    faCalendarDays,
    faChevronDown,
    faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { ALL_STATUSES, STATUS_CONFIG } from "../../../utils/constants";
import type { OrderStatus } from "../../../utils/constants";
import { peso, fmt } from "../../../utils/formatters";
import { StatusBadge } from "../../../components/customer/MyOrders/StatusBadge";
import { Section } from "../Orders/Section";
import { InfoRow } from "../Orders/InfoRow";
import type { Order } from "../../../types/orders";

interface Staff {
    _id: string;
    firstName?: string;
    lastName?: string;
}

interface OrderDetailModalProps {
    order: Order;
    staff: Staff[];
    onClose: () => void;
    onStatusUpdate: (orderId: string, status: OrderStatus) => Promise<void>;
    onAssignDriver: (
        orderId: string,
        driverId: string,
        schedDate: string,
    ) => Promise<void>;
}

function OrderDetailModal({
    order,
    staff,
    onClose,
    onStatusUpdate,
    onAssignDriver,
}: OrderDetailModalProps) {
    const [status, setStatus] = useState<OrderStatus>(order.status);
    const [driverId, setDriverId] = useState(order.driver?._id ?? "");
    const [schedDate, setSchedDate] = useState(
        order.scheduledDeliveryDate
            ? new Date(order.scheduledDeliveryDate).toISOString().slice(0, 16)
            : "",
    );
    const [savingStatus, setSavingStatus] = useState(false);
    const [savingDriver, setSavingDriver] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [driverError, setDriverError] = useState("");

    const customer = order.customer;
    const addr = order.shippingAddress;

    const handleStatusSave = async () => {
        setSavingStatus(true);
        setStatusError("");
        try {
            await onStatusUpdate(order._id, status);
            onClose();
        } catch (e: any) {
            setStatusError(
                e.response?.data?.message ?? "Failed to update status.",
            );
        } finally {
            setSavingStatus(false);
        }
    };

    const handleDriverSave = async () => {
        if (!driverId) {
            setDriverError("Please select a driver.");
            return;
        }
        if (!schedDate) {
            setDriverError("Please set a scheduled delivery date.");
            return;
        }
        setSavingDriver(true);
        setDriverError("");
        try {
            await onAssignDriver(order._id, driverId, schedDate);
            onClose();
        } catch (e: any) {
            setDriverError(
                e.response?.data?.message ?? "Failed to assign driver.",
            );
        } finally {
            setSavingDriver(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon
                                icon={faReceipt}
                                className="text-green-700"
                            />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">
                                Order Details
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                                #{order._id.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-400"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {/* Customer Info */}
                    <Section title="Customer Information" icon={faUser}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InfoRow
                                icon={faUser}
                                label="Name"
                                value={
                                    customer
                                        ? `${customer.firstName} ${customer.lastName}`
                                        : "—"
                                }
                            />
                            <InfoRow
                                icon={faEnvelope}
                                label="Email"
                                value={customer?.email ?? "—"}
                            />
                            <InfoRow
                                icon={faPhone}
                                label="Phone"
                                value={customer?.phoneNumber ?? "—"}
                            />
                            <InfoRow
                                icon={faCalendarDays}
                                label="Ordered"
                                value={fmt(order.createdAt)}
                            />
                        </div>
                    </Section>

                    {/* Shipping Address */}
                    {addr && (
                        <Section title="Shipping Address" icon={faLocationDot}>
                            <p className="text-sm text-slate-600">
                                {[
                                    addr.street,
                                    addr.city,
                                    addr.province,
                                    addr.zipCode,
                                    addr.country,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                            {order.note && (
                                <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    <p className="text-xs text-amber-700">
                                        <span className="font-semibold">
                                            Note:
                                        </span>{" "}
                                        {order.note}
                                    </p>
                                </div>
                            )}
                        </Section>
                    )}

                    {/* Order Items */}
                    <Section title="Order Items" icon={faBoxOpen}>
                        <div className="space-y-2">
                            {order.items?.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                                >
                                    {(() => {
                                        const prod =
                                            typeof item.product === "object"
                                                ? item.product
                                                : undefined;
                                        return prod?.imageUrl ? (
                                            <img
                                                src={prod.imageUrl}
                                                alt={prod.name}
                                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon
                                                    icon={faBoxOpen}
                                                    className="text-gray-400 text-xs"
                                                />
                                            </div>
                                        );
                                    })()}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {(() =>
                                                typeof item.product === "object"
                                                    ? (item.product.name ??
                                                      "Unknown")
                                                    : "Unknown")()}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {peso(item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                                        {peso(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <p className="text-sm font-semibold text-slate-600">
                                    Total Amount
                                </p>
                                <p className="text-lg font-bold text-green-700">
                                    {peso(order.totalAmount)}
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* Driver Info */}
                    {order.driver && (
                        <Section title="Assigned Driver" icon={faTruck}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <InfoRow
                                    icon={faUser}
                                    label="Name"
                                    value={`${order.driver.firstName} ${order.driver.lastName}`}
                                />
                                <InfoRow
                                    icon={faPhone}
                                    label="Phone"
                                    value={order.driver.phoneNumber ?? "—"}
                                />
                                {order.scheduledDeliveryDate && (
                                    <InfoRow
                                        icon={faCalendarDays}
                                        label="Scheduled"
                                        value={fmt(order.scheduledDeliveryDate)}
                                    />
                                )}
                            </div>
                        </Section>
                    )}

                    {/* Delivery Status */}
                    {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                            <Section
                                title="Delivery Status"
                                icon={faClockRotateLeft}
                            >
                                {statusError && (
                                    <p className="text-xs text-red-500 mb-2">
                                        {statusError}
                                    </p>
                                )}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select
                                            value={status}
                                            onChange={(e) =>
                                                setStatus(
                                                    e.target
                                                        .value as OrderStatus,
                                                )
                                            }
                                            className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
                                        >
                                            {ALL_STATUSES.map((s) => (
                                                <option
                                                    key={s}
                                                    value={s}
                                                    className="capitalize"
                                                >
                                                    {STATUS_CONFIG[s]?.label ??
                                                        s}
                                                </option>
                                            ))}
                                        </select>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleStatusSave}
                                        disabled={
                                            savingStatus ||
                                            status === order.status
                                        }
                                        className="px-4 py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {savingStatus && (
                                            <FontAwesomeIcon
                                                icon={faSpinner}
                                                className="animate-spin"
                                            />
                                        )}
                                        Save
                                    </button>
                                </div>
                            </Section>
                        )}

                    {/* Assign Driver */}
                    {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                            <Section title="Assign Driver" icon={faTruck}>
                                {driverError && (
                                    <p className="text-xs text-red-500 mb-2">
                                        {driverError}
                                    </p>
                                )}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select
                                            value={driverId}
                                            onChange={(e) =>
                                                setDriverId(e.target.value)
                                            }
                                            className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
                                        >
                                            <option value="">
                                                Select a driver
                                            </option>
                                            {staff.map((s) => (
                                                <option
                                                    key={s._id}
                                                    value={s._id}
                                                >
                                                    {s.firstName} {s.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5">
                                            Scheduled Delivery Date
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={schedDate}
                                            onChange={(e) =>
                                                setSchedDate(e.target.value)
                                            }
                                            min={new Date()
                                                .toISOString()
                                                .slice(0, 16)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleDriverSave}
                                        disabled={savingDriver}
                                        className="w-full py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {savingDriver && (
                                            <FontAwesomeIcon
                                                icon={faSpinner}
                                                className="animate-spin"
                                            />
                                        )}
                                        {order.driver
                                            ? "Reassign Driver"
                                            : "Assign Driver"}
                                    </button>
                                </div>
                            </Section>
                        )}
                </div>
            </div>
        </div>
    );
}

export { OrderDetailModal };
