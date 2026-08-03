import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faReceipt,
    faBoxOpen,
    faLocationDot,
    faXmark,
    faCheckCircle,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import { peso } from "../../../utils/formatters";
import { StatusBadge } from "./StatusBadge";
import { DeliveryTracker } from "../Home/DeliveryTracker";
import type { Order } from "../../../types/orders";

type FeedbackMap = Record<string, any>;

type ModalAction = (order: Order) => void;

function OrderDetailModal({
    order,
    onClose,
    onCancel,
    onFeedback,
    onReceipt,
    feedbackMap,
}: {
    order: Order;
    onClose: () => void;
    onCancel: ModalAction;
    onFeedback: ModalAction;
    onReceipt: ModalAction;
    feedbackMap: FeedbackMap;
}) {
    const addr = order.shippingAddress;
    const addrStr = addr
        ? [addr.street, addr.city, addr.province, addr.zipCode]
              .filter(Boolean)
              .join(", ")
        : null;
    const hasFeedback = !!feedbackMap[order._id];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon
                                icon={faReceipt}
                                className="text-green-700"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">
                                Order Details
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                                #{order._id.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Delivery Tracker */}
                    {order.status !== "cancelled" && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                                Delivery Status
                            </p>
                            <DeliveryTracker order={order} />
                        </div>
                    )}

                    {/* Shipping address */}
                    {addrStr && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon
                                    icon={faLocationDot}
                                    className="text-slate-400 text-xs"
                                />
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Deliver to
                                </p>
                            </div>
                            <p className="text-sm text-slate-600">{addrStr}</p>
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
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                            Items Ordered
                        </p>
                        <div className="space-y-2">
                            {order.items?.map((item, i) => {
                                const prod =
                                    typeof item.product === "object"
                                        ? item.product
                                        : undefined;
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                                    >
                                        {prod?.imageUrl ? (
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
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {prod?.name ?? "Item"}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {peso(item.price)} ×{" "}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                                            {peso(item.price * item.quantity)}
                                        </p>
                                    </div>
                                );
                            })}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <p className="text-sm font-semibold text-slate-600">
                                    Total
                                </p>
                                <p className="text-lg font-bold text-green-700">
                                    {peso(order.totalAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        {/* Receipt button — always shown */}
                        <button
                            onClick={() => onReceipt(order)}
                            className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-sm font-semibold hover:bg-slate-100 transition flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faReceipt} />
                            View Receipt
                        </button>

                        {order.status === "pending" && (
                            <button
                                onClick={() => onCancel(order)}
                                className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                                Cancel Order
                            </button>
                        )}
                        {order.status === "delivered" && !hasFeedback && (
                            <button
                                onClick={() => onFeedback(order)}
                                className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold hover:bg-amber-100 transition flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faStar} />
                                Leave Feedback
                            </button>
                        )}
                        {order.status === "delivered" && hasFeedback && (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-medium">
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Feedback submitted
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export { OrderDetailModal };
