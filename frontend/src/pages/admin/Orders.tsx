import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faEye,
    faFilter,
    faList,
    faTableCells,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { STATUS_CONFIG, ALL_STATUSES } from "../../utils/constants";
import type { OrderStatus } from "../../utils/constants";
import { peso, fmt } from "../../utils/formatters";
import { StatusBadge } from "../../components/customer/MyOrders/StatusBadge";
import { OrderDetailModal } from "../../components/admin/Orders/OrderDetailModal";
import { OrderCard } from "../../components/admin/Orders/OrderCard";
import type { Order } from "../../types/orders";

interface Staff {
    _id: string;
    firstName?: string;
    lastName?: string;
    role: string;
}

type ViewMode = "table" | "grid";
type FilterValue = "all" | OrderStatus;

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterValue>("all");
    const [selected, setSelected] = useState<Order | null>(null);
    const [view, setView] = useState<ViewMode>("table");

    const fetchAll = async () => {
        try {
            const [oRes, uRes] = await Promise.all([
                api.get("/order/get-all-orders"),
                api.get("/auth/users"),
            ]);
            setOrders(oRes.data ?? []);
            setStaff(
                (uRes.data.users ?? []).filter(
                    (u: Staff) => u.role === "staff",
                ),
            );
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
        await api.put(`/order/update-order-status/${orderId}`, { status });
        await fetchAll();
    };

    const handleAssignDriver = async (
        orderId: string,
        driverId: string,
        scheduledDeliveryDate: string,
    ) => {
        await api.put(`/order/assign-driver/${orderId}`, {
            driverId,
            scheduledDeliveryDate,
        });
        await fetchAll();
    };

    // ── counts for filter tabs ─────────────────────────────────────────────
    const counts = orders.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
    }, {});

    const filtered = orders.filter((o) => {
        const matchStatus = filter === "all" || o.status === filter;
        const q = search.toLowerCase();
        const customer = o.customer;
        const matchSearch =
            !q ||
            customer?.firstName?.toLowerCase().includes(q) ||
            customer?.lastName?.toLowerCase().includes(q) ||
            customer?.email?.toLowerCase().includes(q) ||
            o._id.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const sorted = [...filtered].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Orders
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {orders.length} total orders
                    </p>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex sm:flex-row gap-3 max-w-fit">
                    {/* Search */}
                    <div className="relative max-w-sm">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Search by customer or order ID…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 max-w-fit">
                        <button
                            onClick={() => setView("table")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition ${view === "table" ? "bg-white shadow text-green-700" : "text-slate-500"}`}
                        >
                            <FontAwesomeIcon icon={faList} />
                        </button>
                        <button
                            onClick={() => setView("grid")}
                            className={`bg-gray-200 px-3 py-1.5 rounded-lg text-sm transition ${view === "grid" ? "bg-white shadow text-green-700" : "text-slate-500"}`}
                        >
                            <FontAwesomeIcon icon={faTableCells} />
                        </button>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        {
                            key: "all" as FilterValue,
                            label: "All",
                            count: orders.length,
                        },
                        ...ALL_STATUSES.map((s) => ({
                            key: s as FilterValue,
                            label: STATUS_CONFIG[s].label,
                            count: counts[s] ?? 0,
                        })),
                    ].map((tab) => (
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
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-xs font-bold
                                ${filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-slate-500"}`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {view === "table" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-5 py-3 text-slate-500 font-medium">
                                            Name
                                        </th>
                                        <th className="text-left px-5 py-3 text-slate-500 font-medium">
                                            Status
                                        </th>
                                        <th className="text-left px-5 py-3 text-slate-500 font-medium">
                                            Price
                                        </th>
                                        <th className="text-left px-5 py-3 text-slate-500 font-medium">
                                            Date Ordered
                                        </th>
                                        <th className="text-left px-5 py-3 text-slate-500 font-medium">
                                            Payment Status
                                        </th>
                                        <th className="text-left px-5 py-3 text-slate-500 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sorted.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="text-center py-12 text-slate-400"
                                            >
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        sorted.map((o) => (
                                            <tr
                                                key={o._id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-medium text-slate-700">
                                                            {o.customer
                                                                ? `${o.customer.firstName} ${o.customer.lastName}`
                                                                : "Unknown Customer"}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            #
                                                            {o._id
                                                                .slice(-8)
                                                                .toUpperCase()}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={o.status}
                                                    />
                                                </td>
                                                <td className="px-5 py-4 font-semibold text-slate-700">
                                                    {peso(o.totalAmount)}
                                                </td>
                                                <td className="px-5 py-4 text-slate-500">
                                                    {fmt(o.createdAt)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            o.paymentStatus ??
                                                            "—"
                                                        }
                                                    />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        onClick={() =>
                                                            setSelected(o)
                                                        }
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEye}
                                                        />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sorted.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center col-span-full">
                                <FontAwesomeIcon
                                    icon={faFilter}
                                    className="text-4xl text-gray-200 mb-3"
                                />
                                <p className="text-slate-400 text-sm">
                                    No orders found
                                </p>
                            </div>
                        ) : (
                            sorted.map((o) => (
                                <OrderCard
                                    key={o._id}
                                    order={o}
                                    onView={(order) =>
                                        setSelected(order as any)
                                    }
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {selected && (
                <OrderDetailModal
                    order={selected}
                    staff={staff}
                    onClose={() => setSelected(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onAssignDriver={handleAssignDriver}
                />
            )}
        </>
    );
}
