import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import ReceiptModal from "../../components/customer/ReceiptModal";
import { FeedbackModal } from "../../components/customer/MyOrders/FeedbackModal";
import { CancelModal } from "../../components/customer/MyOrders/CancelModal";
import { OrderDetailModal } from "../../components/customer/MyOrders/OrderDetailModal";
import { OrderCard } from "../../components/customer/MyOrders/OrderCard";
import type { Order } from "../../types/orders";

type MyOrder = Order;

type Feedback = {
    order?: { _id?: string } | string;
};

type FeedbackMap = Record<string, any>;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [feedbackMap, setFeedbackMap] = useState<FeedbackMap>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState<MyOrder | null>(null);
    const [toCancel, setToCancel] = useState<MyOrder | null>(null);
    const [toFeedback, setToFeedback] = useState<MyOrder | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [toReceipt, setToReceipt] = useState<MyOrder | null>(null); // ← NEW
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3500);
    };

    const fetchAll = async () => {
        try {
            const [oRes, fRes] = await Promise.all([
                api.get("/order/my-orders"),
                api.get("/feedback/my-feedbacks"),
            ]);
            const orders = oRes.data ?? [];
            const feedbacks = (fRes.data as Feedback[]) ?? [];
            setOrders(orders);
            const map: Record<string, Feedback> = {};
            feedbacks.forEach((f) => {
                const oid =
                    typeof f.order === "string" ? f.order : f.order?._id;
                if (oid) map[oid] = f;
            });
            setFeedbackMap(map);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleCancel = async () => {
        setCancelling(true);
        if (!toCancel) {
            setCancelling(false);
            return;
        }
        try {
            await api.put(`/order/cancel-order/${toCancel._id}`);
            setToCancel(null);
            setSelected(null);
            showToast("Order cancelled successfully.");
            await fetchAll();
        } catch (e: unknown) {
            console.error(e);
        } finally {
            setCancelling(false);
        }
    };

    const handleFeedbackSuccess = async () => {
        showToast("Feedback submitted! Thank you.");
        await fetchAll();
    };

    const ALL_FILTERS = [
        { key: "all", label: "All" },
        { key: "pending", label: "Pending" },
        { key: "processing", label: "Processing" },
        { key: "shipped", label: "On the Way" },
        { key: "delivered", label: "Delivered" },
        { key: "cancelled", label: "Cancelled" },
    ];

    const counts = orders.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
    }, {});

    const filtered = [...orders]
        .filter((o) => filter === "all" || o.status === filter)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading orders…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {toast}
                </div>
            )}

            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        My Orders
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {orders.length} total order
                        {orders.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {ALL_FILTERS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition
                                ${
                                    filter === tab.key
                                        ? "bg-green-700 text-white"
                                        : "bg-white border border-gray-200 text-slate-500 hover:bg-gray-50"
                                }`}
                        >
                            {tab.label}
                            {tab.key !== "all" && counts[tab.key] > 0 && (
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold
                                    ${filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-slate-500"}`}
                                >
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <FontAwesomeIcon
                            icon={faReceipt}
                            className="text-4xl text-gray-200 mb-3"
                        />
                        <p className="text-slate-400 text-sm">
                            No orders found
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filtered.map((o) => (
                            <OrderCard
                                key={o._id}
                                order={o}
                                feedbackMap={feedbackMap}
                                onView={setSelected}
                                onCancel={setToCancel}
                                onFeedback={setToFeedback}
                                onReceipt={(order) => setToReceipt(order)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <OrderDetailModal
                    order={selected}
                    feedbackMap={feedbackMap}
                    onClose={() => setSelected(null)}
                    onCancel={(o) => {
                        setSelected(null);
                        setToCancel(o);
                    }}
                    onFeedback={(o) => {
                        setSelected(null);
                        setToFeedback(o);
                    }}
                    onReceipt={(o) => {
                        setSelected(null);
                        setToReceipt(o);
                    }}
                />
            )}

            {/* Cancel Modal */}
            {toCancel && (
                <CancelModal
                    order={toCancel}
                    onClose={() => setToCancel(null)}
                    onConfirm={handleCancel}
                    cancelling={cancelling}
                />
            )}

            {/* Feedback Modal */}
            {toFeedback && (
                <FeedbackModal
                    order={toFeedback}
                    onClose={() => setToFeedback(null)}
                    onSuccess={handleFeedbackSuccess}
                />
            )}

            {/* Receipt Modal ← NEW */}
            {toReceipt && (
                <ReceiptModal
                    order={toReceipt}
                    onClose={() => setToReceipt(null)}
                />
            )}
        </>
    );
}
