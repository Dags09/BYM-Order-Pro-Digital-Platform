import { useState } from "react";
import api from "../../../lib/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import type { Order, OrderItem } from "../../../types/orders";

function FeedbackModal({
    order,
    onClose,
    onSuccess,
}: {
    order: Order;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setSaving(true);
        setError("");
        try {
            await api.post("/feedback/create-feedback", {
                orderId: order._id,
                rating,
                comment,
            });
            onSuccess();
            onClose();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setError(
                err.response?.data?.message ?? "Failed to submit feedback.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <p className="font-bold text-slate-800">
                            Leave Feedback
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                            #{order._id.slice(-8).toUpperCase()}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            Your Rating
                        </p>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="text-3xl transition-transform hover:scale-110"
                                >
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className={
                                            star <= (hover || rating)
                                                ? "text-amber-400"
                                                : "text-gray-200"
                                        }
                                    />
                                </button>
                            ))}
                            <span className="text-sm text-slate-400 ml-1">
                                {
                                    [
                                        "",
                                        "Poor",
                                        "Fair",
                                        "Good",
                                        "Very Good",
                                        "Excellent",
                                    ][hover || rating]
                                }
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Comment (optional)
                        </p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience…"
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {saving && (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                            )}
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { FeedbackModal };
