import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faCalendarDays,
    faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { peso, fmt } from "../../../utils/formatters";
import { Avatar } from "../../../components/common/Avatar";
import { Stars } from "../../../components/admin/Feedback/Stars";
import type { Feedback } from "../../../types/feedback";

interface FeedbackCardProps {
    feedback: Feedback;
    onDelete: (feedback: Feedback) => void;
}
function FeedbackCard({ feedback, onDelete }: FeedbackCardProps) {
    const customer = feedback.customer;
    const order = feedback.order;
    const name = customer
        ? `${customer.firstName} ${customer.lastName}`
        : "Anonymous";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition">
            {/* Header */}
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
                        <p className="text-xs text-slate-400">
                            {customer?.email ?? "—"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(feedback)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition flex-shrink-0"
                    title="Delete feedback"
                >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                </button>
            </div>

            {/* Rating + comment */}
            <div>
                <Stars rating={feedback.rating ?? 0} />
                <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {feedback.comment || (
                        <em className="text-slate-300">No comment provided</em>
                    )}
                </p>
            </div>

            {/* Order info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                    {order ? (
                        <span>
                            {peso(order.totalAmount)} ·{" "}
                            <span className="capitalize">{order.status}</span>
                        </span>
                    ) : (
                        <span>Order unavailable</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <FontAwesomeIcon
                        icon={faCalendarDays}
                        className="text-xs"
                    />
                    {fmt(feedback.createdAt)}
                </div>
            </div>
        </div>
    );
}
export { FeedbackCard };
