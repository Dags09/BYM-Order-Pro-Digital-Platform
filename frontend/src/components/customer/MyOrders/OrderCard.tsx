import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen,
    faReceipt,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import { peso, fmt } from "../../../utils/formatters";
import { StatusBadge } from "../MyOrders/StatusBadge";
import { DeliveryTracker } from "../Home/DeliveryTracker";
import type { Order } from "../../../types/orders";

type FeedbackMap = Record<string, any>;

type ModalAction = (order: Order) => void;

function OrderCard({
    order,
    onView,
    onCancel,
    onFeedback,
    onReceipt,
    feedbackMap,
}: {
    order: Order;
    onView: ModalAction;
    onCancel: ModalAction;
    onFeedback: ModalAction;
    onReceipt: ModalAction;
    feedbackMap: FeedbackMap;
}) {
    const items = order.items ?? [];
    const itemCount = items.length;
    const thumb = items[0]?.product?.imageUrl;
    const hasFeedback = !!feedbackMap[order._id];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            {/* Top */}
            <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {thumb ? (
                        <img
                            src={thumb}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="text-gray-300"
                            />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 font-mono">
                            #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {fmt(order.createdAt)}
                        </p>
                        <p className="text-xs text-slate-400">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={order.status} />
                    <p className="text-base font-bold text-slate-800">
                        {peso(order.totalAmount)}
                    </p>
                </div>
            </div>

            {/* Item thumbnails */}
            {items.length > 0 && (
                <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                    {items.slice(0, 4).map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1"
                        >
                            {item.product?.imageUrl ? (
                                <img
                                    src={item.product.imageUrl}
                                    alt=""
                                    className="w-4 h-4 rounded object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faBoxOpen}
                                    className="text-slate-300 text-xs"
                                />
                            )}
                            <span className="text-xs text-slate-500 truncate max-w-[70px]">
                                {item.product?.name ?? "Item"}
                            </span>
                            <span className="text-xs text-slate-400">
                                ×{item.quantity}
                            </span>
                        </div>
                    ))}
                    {itemCount > 4 && (
                        <span className="text-xs text-slate-400">
                            +{itemCount - 4} more
                        </span>
                    )}
                </div>
            )}

            {/* Delivery tracker (compact) */}
            {!["cancelled", "delivered"].includes(order.status) && (
                <div className="px-4 pb-4">
                    <DeliveryTracker order={order} />
                </div>
            )}

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center gap-2 border-t border-gray-50 pt-3 flex-wrap">
                <button
                    onClick={() => onView(order)}
                    className="flex-1 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition"
                >
                    View Details
                </button>

                {/* ── NEW: Receipt button ── */}
                <button
                    onClick={() => onReceipt(order)}
                    className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition flex items-center justify-center gap-1"
                >
                    <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                    Receipt
                </button>

                {order.status === "pending" && (
                    <button
                        onClick={() => onCancel(order)}
                        className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"
                    >
                        Cancel
                    </button>
                )}
                {order.status === "delivered" && !hasFeedback && (
                    <button
                        onClick={() => onFeedback(order)}
                        className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-semibold hover:bg-amber-100 transition flex items-center justify-center gap-1"
                    >
                        <FontAwesomeIcon icon={faStar} className="text-xs" />
                        Feedback
                    </button>
                )}
                {order.status === "delivered" && hasFeedback && (
                    <span className="flex-1 text-center text-xs text-emerald-600 font-medium py-2">
                        ✓ Reviewed
                    </span>
                )}
            </div>
        </div>
    );
}
export { OrderCard };
