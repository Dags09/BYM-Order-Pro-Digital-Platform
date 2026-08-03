import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTruck, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "../../customer/MyOrders/StatusBadge";
import { Avatar } from "../../../components/common/Avatar";
import { peso, fmt } from "../../../utils/formatters";
import type { Order } from "../../../types/orders";

interface OrderCardProps {
    order: Order;
    onView: (order: Order) => void;
}

function OrderCard({ order, onView }: OrderCardProps) {
    const customer = order.customer;
    const name = customer
        ? `${customer.firstName} ${customer.lastName}`
        : "Unknown";

    const itemCount = order.items?.length ?? 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition flex flex-col gap-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                        name={name}
                        color={customer?.badgeColor}
                        className="w-9 h-9 rounded-full text-xs flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                            {name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                            #{order._id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                </div>
                <StatusBadge status={order.status} />
            </div>

            {/* Items preview */}
            <div className="flex items-center gap-2 flex-wrap">
                {order.items?.slice(0, 3).map((item, i) => {
                    const prod =
                        typeof item.product === "object"
                            ? item.product
                            : undefined;
                    return (
                        <div
                            key={i}
                            className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1"
                        >
                            {prod?.imageUrl ? (
                                <img
                                    src={prod.imageUrl}
                                    alt=""
                                    className="w-5 h-5 rounded object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faBoxOpen}
                                    className="text-slate-300 text-xs"
                                />
                            )}
                            <span className="text-xs text-slate-500 truncate max-w-[80px]">
                                {prod?.name ?? "Item"}
                            </span>
                            <span className="text-xs text-slate-400">
                                ×{item.quantity}
                            </span>
                        </div>
                    );
                })}
                {itemCount > 3 && (
                    <span className="text-xs text-slate-400">
                        +{itemCount - 3} more
                    </span>
                )}
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div>
                    <p className="text-lg font-bold text-slate-800">
                        {peso(order.totalAmount)}
                    </p>
                    <p className="text-xs text-slate-400">
                        {fmt(order.createdAt)}
                    </p>
                </div>
                {order.driver && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FontAwesomeIcon icon={faTruck} />
                        <span className="truncate max-w-[100px]">
                            {order.driver.firstName} {order.driver.lastName}
                        </span>
                    </div>
                )}
                <button
                    onClick={() => onView(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition"
                >
                    <FontAwesomeIcon icon={faEye} />
                    Details
                </button>
            </div>
        </div>
    );
}

export { OrderCard };
