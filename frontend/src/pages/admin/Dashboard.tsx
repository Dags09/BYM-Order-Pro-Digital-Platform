import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCartArrowDown,
    faMoneyBill1,
    faUsers,
    faBox,
    faStar as faStarSolid,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore.ts";
import { peso, fmt } from "../../utils/formatters.ts";
import { StatCard } from "../../components/admin/Dashboard/StatCard.tsx";
import { Badge } from "../../components/admin/Dashboard/Badge.tsx";
import {
    STOCK_THRESHOLD,
    STATUS_COLOR,
    PIE_COLORS,
} from "../../utils/constants.ts";
import type { OrderStatus } from "../../utils/constants.ts";

import type { Order } from "../../types/orders";
import type { Product } from "../../types/products";
import type { User } from "../../types/user";

interface Feedback {
    _id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    customer?: User;
}

const STARS = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? "text-amber-400" : "text-gray-200"}>
            ★
        </span>
    ));

// ── main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [oRes, pRes, usersRes, fRes] = await Promise.all([
                    api.get("/order/get-all-orders"),
                    api.get("/product/get-all-products"),
                    api.get("/auth/users"),
                    api.get("/feedback/get-all-feedback"),
                ]);
                setOrders(oRes.data ?? []);
                setProducts(pRes.data ?? []);
                setUsers(usersRes.data.users ?? []);
                setFeedbacks(fRes.data ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── derived stats ──────────────────────────────────────────────────────
    const totalRevenue = orders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + (o.totalAmount ?? 0), 0);

    const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
    }));

    // ── revenue area chart (last 7 days) ───────────────────────────────────
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });
    const revenueData = last7.map((d) => {
        const label = d.toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
        });
        const rev = orders
            .filter((o) => {
                const od = new Date(o.createdAt);
                return (
                    o.status === "delivered" &&
                    od.getFullYear() === d.getFullYear() &&
                    od.getMonth() === d.getMonth() &&
                    od.getDate() === d.getDate()
                );
            })
            .reduce((s, o) => s + (o.totalAmount ?? 0), 0);
        return { label, rev };
    });

    // ── top selling products ───────────────────────────────────────────────
    const soldMap: Record<string, number> = {};
    orders.forEach((o) => {
        if (o.status === "cancelled") return;
        (o.items ?? []).forEach((item) => {
            const pid =
                typeof item.product === "string"
                    ? item.product
                    : item.product?._id;
            if (!pid) return;
            soldMap[pid] = (soldMap[pid] ?? 0) + (item.quantity ?? 0);
        });
    });

    const topProducts = products
        .map((p) => ({ ...p, sold: soldMap[p._id] ?? 0 }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

    // ── total customers ───────────────────────────────────────────────────
    const totalCustomers = users.filter((u) => u.role === "customer").length;

    // ── low stock ──────────────────────────────────────────────────────────
    const lowStock = products
        .filter((p) => p.stock <= STOCK_THRESHOLD)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

    // ── recent orders ──────────────────────────────────────────────────────
    const recentOrders = [...orders]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

    // ── recent feedbacks ───────────────────────────────────────────────────
    const recentFeedbacks = [...feedbacks]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 4);

    const avgRating = feedbacks.length
        ? (
              feedbacks.reduce((s, f) => s + (f.rating ?? 0), 0) /
              feedbacks.length
          ).toFixed(1)
        : "—";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading dashboard…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    Welcome back, {user?.firstName}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                    Here's what's happening with your store today.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Orders"
                    value={orders.length}
                    sub={`${statusCounts.pending ?? 0} pending`}
                    icon={faCartArrowDown}
                    iconClassName="text-green-700 bg-green-50"
                />
                <StatCard
                    label="Total Revenue"
                    value={peso(totalRevenue)}
                    sub="Delivered orders only"
                    icon={faMoneyBill1}
                    iconClassName="text-blue-700 bg-green-50"
                />
                <StatCard
                    label="Total Active Customers"
                    value={totalCustomers}
                    icon={faUsers}
                    iconClassName="text-black bg-green-50"
                />
                <StatCard
                    label="Avg Rating"
                    value={avgRating}
                    sub={`${feedbacks.length} feedbacks`}
                    icon={faStarSolid}
                    iconClassName="text-amber-400 bg-green-50"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-semibold text-slate-800">
                                Revenue Overview
                            </p>
                            <p className="text-xs text-slate-400">
                                Last 7 days (delivered orders)
                            </p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart
                            data={revenueData}
                            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="revGrad"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#16a34a"
                                        stopOpacity={0.18}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#16a34a"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) =>
                                    `₱${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                                }
                            />
                            <Tooltip
                                formatter={(v) => [
                                    peso(v as number),
                                    "Revenue",
                                ]}
                                contentStyle={{
                                    borderRadius: 10,
                                    border: "none",
                                    boxShadow: "0 4px 20px rgba(0,0,0,.08)",
                                    fontSize: 12,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="rev"
                                stroke="#16a34a"
                                strokeWidth={2.5}
                                fill="url(#revGrad)"
                                dot={{ r: 3, fill: "#16a34a" }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Pie */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="font-semibold text-slate-800 mb-1">
                        Order Overview
                    </p>
                    <p className="text-xs text-slate-400 mb-3">By status</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                dataKey="value"
                                paddingAngle={3}
                            >
                                {pieData.map((entry, i) => (
                                    <Cell
                                        key={i}
                                        fill={
                                            STATUS_COLOR[
                                                entry.name as OrderStatus
                                            ]?.dot ??
                                            PIE_COLORS[i % PIE_COLORS.length]
                                        }
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(v, n) => [v, n]}
                                contentStyle={{
                                    borderRadius: 10,
                                    border: "none",
                                    boxShadow: "0 4px 20px rgba(0,0,0,.08)",
                                    fontSize: 12,
                                }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(v) => (
                                    <span className="text-xs capitalize text-slate-600">
                                        {v}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-slate-800">
                            Top Selling Products
                        </p>
                        <button
                            onClick={() => navigate("/admin/products")}
                            className="text-xs text-green-700 font-medium hover:underline"
                        >
                            View all
                        </button>
                    </div>
                    <div className="space-y-3">
                        {topProducts.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">
                                No data yet
                            </p>
                        ) : (
                            topProducts.map((p, i) => (
                                <div
                                    key={p._id}
                                    className="flex items-center gap-3"
                                >
                                    <span className="text-xs font-bold text-slate-300 w-4">
                                        {i + 1}
                                    </span>
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.name}
                                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                                            📦
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {p.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {peso(p.price)}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-slate-700">
                                            {p.sold}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            sold
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800">
                                Low Stock Alert
                            </p>
                            {lowStock.length > 0 && (
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {lowStock.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => navigate("/admin/products")}
                            className="text-xs text-green-700 font-medium hover:underline"
                        >
                            View all
                        </button>
                    </div>
                    <div className="space-y-3">
                        {lowStock.length === 0 ? (
                            <div className="text-center py-6">
                                <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    className="text-2xl text-emerald-500 mb-1"
                                />
                                <p className="text-sm text-slate-400">
                                    All products well stocked
                                </p>
                            </div>
                        ) : (
                            lowStock.map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-center gap-3"
                                >
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.name}
                                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
                                            <FontAwesomeIcon
                                                icon={faBox}
                                                className="text-slate-400"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {p.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {peso(p.price)}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                p.stock === 0
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-amber-100 text-amber-700"
                                            }`}
                                        >
                                            {p.stock === 0
                                                ? "Out of stock"
                                                : `${p.stock} left`}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-slate-800">
                            Recent Orders
                        </p>
                        <button
                            onClick={() => navigate("/admin/orders")}
                            className="text-xs text-green-700 font-medium hover:underline"
                        >
                            View all
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6">
                                No orders yet
                            </p>
                        ) : (
                            recentOrders.map((o) => {
                                const customer = o.customer;
                                const name = customer
                                    ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
                                    : "Unknown";
                                return (
                                    <div
                                        key={o._id}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-base flex-shrink-0">
                                            🧾
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {name}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {fmt(o.createdAt)}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-slate-700">
                                                {peso(o.totalAmount)}
                                            </p>
                                            <Badge status={o.status} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Feedbacks */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="font-semibold text-slate-800">
                            Recent Feedbacks
                        </p>
                        <p className="text-xs text-slate-400">
                            Average rating:{" "}
                            <span className="text-amber-500 font-semibold">
                                {avgRating} ★
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/feedbacks")}
                        className="text-xs text-green-700 font-medium hover:underline"
                    >
                        View all
                    </button>
                </div>
                {recentFeedbacks.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">
                        No feedbacks yet
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentFeedbacks.map((f) => {
                            const name = f.customer
                                ? `${f.customer.firstName ?? ""} ${f.customer.lastName ?? ""}`.trim()
                                : "Anonymous";
                            const initials = name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();
                            return (
                                <div
                                    key={f._id}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar
                                            name={name}
                                            color={f.customer?.badgeColor}
                                            className="w-8 h-8 rounded-full text-xs flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {name}
                                            </p>
                                            <div className="flex text-sm leading-none">
                                                {STARS(f.rating ?? 0)}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {f.comment || <em>No comment</em>}
                                    </p>
                                    <p className="text-xs text-slate-300 mt-2">
                                        {fmt(f.createdAt)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
