import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Phone,
    PackageCheck,
    Truck,
    ChevronRight,
    Search,
} from "lucide-react";
import api from "../../lib/axios";
import type { Order, OrderStatus } from "../../types/order";
import {
    formatPrice,
    formatDateTime,
    formatShortDate,
} from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type FilterTab = "all" | OrderStatus;

const TABS: FilterTab[] = [
    "all",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

interface Driver {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    activeDeliveries: number;
}

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function ManagerDriverDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [driver, setDriver] = useState<Driver | null>(null);
    const [history, setHistory] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        // There's no single-driver endpoint yet, so pull the roster and
        // the full order list, then derive this driver's profile and
        // delivery history from them.
        Promise.all([
            api.get("/driver/list-drivers"),
            api.get("/order/get-all-orders"),
        ])
            .then(([driversRes, ordersRes]) => {
                const match = (driversRes.data as Driver[]).find(
                    (d) => d._id === id,
                );
                if (!match) {
                    setError("Driver not found.");
                    return;
                }
                setDriver(match);
                const assigned = (ordersRes.data as Order[])
                    .filter((o) => o.driver?._id === id)
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                    );
                setHistory(assigned);
            })
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load this driver.")),
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    if (error || !driver) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate("/manager/drivers")}
                    className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                    Back to drivers
                </button>
                <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                    {error ?? "Driver not found."}
                </div>
            </div>
        );
    }

    const completed = history.filter((o) => o.status === "delivered").length;
    const cancelled = history.filter((o) => o.status === "cancelled").length;

    const filteredHistory = history
        .filter((o) => tab === "all" || o.status === tab)
        .filter((o) => {
            if (!search.trim()) return true;
            const q = search.trim().toLowerCase();
            const name = o.customer
                ? `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase()
                : "";
            return name.includes(q) || o._id.toLowerCase().includes(q);
        });

    const countFor = (t: FilterTab) =>
        t === "all"
            ? history.length
            : history.filter((o) => o.status === t).length;

    return (
        <div className="space-y-5 pb-10">
            <button
                onClick={() => navigate("/manager/drivers")}
                className="flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink"
            >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                Back to drivers
            </button>

            {/* Profile */}
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="font-display text-xl font-semibold text-ink">
                            {driver.firstName} {driver.lastName}
                        </p>
                        <p className="text-xs text-ink/40">
                            Driver since {formatShortDate(driver.createdAt)}
                        </p>
                    </div>
                    <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            !driver.isActive
                                ? "bg-route/10 text-route"
                                : !driver.emailVerified
                                  ? "bg-signal/15 text-signal-dark"
                                  : "bg-crate/10 text-crate"
                        }`}
                    >
                        {!driver.isActive
                            ? "Disabled"
                            : !driver.emailVerified
                              ? "Unverified"
                              : "Active"}
                    </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-ink/70">
                    <a
                        href={`mailto:${driver.email}`}
                        className="flex items-center gap-2 hover:underline"
                    >
                        <Mail
                            className="h-4 w-4 shrink-0 text-ink/40"
                            strokeWidth={1.75}
                        />
                        {driver.email}
                    </a>
                    {driver.phoneNumber && (
                        <a
                            href={`tel:${driver.phoneNumber}`}
                            className="flex items-center gap-2 text-crate hover:underline"
                        >
                            <Phone
                                className="h-4 w-4 shrink-0"
                                strokeWidth={1.75}
                            />
                            {driver.phoneNumber}
                        </a>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4 text-center">
                    <div>
                        <p className="font-display text-lg font-semibold text-ink">
                            {driver.activeDeliveries}
                        </p>
                        <p className="text-xs text-ink/50">Active</p>
                    </div>
                    <div>
                        <p className="font-display text-lg font-semibold text-ink">
                            {completed}
                        </p>
                        <p className="text-xs text-ink/50">Delivered</p>
                    </div>
                    <div>
                        <p className="font-display text-lg font-semibold text-ink">
                            {cancelled}
                        </p>
                        <p className="text-xs text-ink/50">Cancelled</p>
                    </div>
                </div>
            </div>

            {/* Delivery history */}
            <div className="rounded-lg border border-ink/10 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-sm font-semibold text-ink">
                        Delivery history
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-kraft/30 p-1">
                            {TABS.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`rounded-[4px] px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                                        tab === t
                                            ? "bg-crate text-white"
                                            : "text-ink/60 hover:text-ink"
                                    }`}
                                >
                                    {t === "all" ? "All" : STATUS_LABELS[t]}
                                    <span
                                        className={`ml-1 ${tab === t ? "text-white/70" : "text-ink/40"}`}
                                    >
                                        {countFor(t)}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30"
                                strokeWidth={1.75}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order or customer"
                                className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 py-1.5 pl-8 pr-3 text-xs text-ink outline-none transition focus:border-crate sm:w-48"
                            />
                        </div>
                    </div>
                </div>

                {history.length === 0 ? (
                    <div className="p-8 text-center">
                        <Truck
                            className="mx-auto h-8 w-8 text-ink/20"
                            strokeWidth={1.5}
                        />
                        <p className="mt-2 text-sm text-ink/50">
                            No deliveries assigned to this driver yet.
                        </p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-ink/50">
                            No deliveries match this filter.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-ink/5">
                        {filteredHistory.map((order) => (
                            <button
                                key={order._id}
                                onClick={() =>
                                    navigate(`/manager/orders/${order._id}`)
                                }
                                className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-kraft/30"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                                            style={{
                                                backgroundColor:
                                                    STATUS_COLORS[order.status],
                                            }}
                                        >
                                            {STATUS_LABELS[order.status]}
                                        </span>
                                        <span className="font-mono text-xs text-ink/40">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <span className="text-xs text-ink/40">
                                            {formatDateTime(order.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-ink/70">
                                        {order.customer
                                            ? `${order.customer.firstName} ${order.customer.lastName}`
                                            : "Deleted customer"}{" "}
                                        · {order.shippingAddress.city}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <span className="flex items-center gap-1 text-sm font-medium text-ink/80">
                                        <PackageCheck
                                            className="h-3.5 w-3.5 text-ink/40"
                                            strokeWidth={1.75}
                                        />
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-ink/30" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
