import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Package,
    ChevronRight,
    ChevronLeft,
    Search,
    Truck,
    X,
    List,
    LayoutGrid,
    SlidersHorizontal,
    Filter,
} from "lucide-react";
import api from "../../lib/axios";
import type { Order, OrderStatus } from "../../types/order";
import { formatPrice, formatDateTime } from "../../utils/formatters";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type FilterTab = "all" | OrderStatus;
type ViewMode = "list" | "card";
type CardSize = "small" | "medium" | "large";
type DateMode = "all" | "day" | "week" | "month" | "year" | "range";

const DATE_MODES: { value: DateMode; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "range", label: "Range" },
];

const TABS: FilterTab[] = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const CARD_GRID_CLASS: Record<CardSize, string> = {
    small: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    medium: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    large: "grid-cols-1 sm:grid-cols-2",
};

// Orders per page, keyed by the active view.
const LIST_PAGE_SIZE = 5;
const CARD_PAGE_SIZE: Record<CardSize, number> = {
    small: 40,
    medium: 9,
    large: 6,
};

function customerName(order: Order) {
    return order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : "Deleted customer";
}

function driverName(order: Order) {
    return order.driver
        ? `${order.driver.firstName} ${order.driver.lastName}`
        : "Unassigned";
}

// Converts an <input type="week"> value ("2026-W36") into its Mon-Sun date range.
function isoWeekToRange(weekValue: string): { start: Date; end: Date } | null {
    const match = /^(\d{4})-W(\d{2})$/.exec(weekValue);
    if (!match) return null;
    const year = Number(match[1]);
    const week = Number(match[2]);

    const jan4 = new Date(year, 0, 4);
    const jan4Day = (jan4.getDay() + 6) % 7; // Monday = 0
    const week1Monday = new Date(jan4);
    week1Monday.setDate(jan4.getDate() - jan4Day);

    const start = new Date(week1Monday);
    start.setDate(week1Monday.getDate() + (week - 1) * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

export default function ManagerOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");
    const [dateMode, setDateMode] = useState<DateMode>("all");
    const [dateDay, setDateDay] = useState("");
    const [dateWeek, setDateWeek] = useState("");
    const [dateMonth, setDateMonth] = useState("");
    const [dateYear, setDateYear] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [cardSize, setCardSize] = useState<CardSize>("medium");
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchOrders = useCallback(() => {
        setLoading(true);
        api.get("/order/get-all-orders")
            .then(({ data }) => setOrders(data))
            .catch(() => setError("Couldn't load orders."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filtered = orders
        .filter((o) => tab === "all" || o.status === tab)
        .filter((o) => {
            if (!search.trim()) return true;
            const q = search.trim().toLowerCase();
            const name = o.customer
                ? `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase()
                : "";
            return (
                name.includes(q) ||
                o._id.toLowerCase().includes(q) ||
                (o.customer?.email.toLowerCase().includes(q) ?? false)
            );
        })
        .filter((o) => {
            const created = new Date(o.createdAt);
            switch (dateMode) {
                case "all":
                    return true;
                case "day": {
                    if (!dateDay) return true;
                    const [y, m, d] = dateDay.split("-").map(Number);
                    return (
                        created.getFullYear() === y &&
                        created.getMonth() === m - 1 &&
                        created.getDate() === d
                    );
                }
                case "week": {
                    if (!dateWeek) return true;
                    const range = isoWeekToRange(dateWeek);
                    if (!range) return true;
                    return created >= range.start && created <= range.end;
                }
                case "month": {
                    if (!dateMonth) return true;
                    const [y, m] = dateMonth.split("-").map(Number);
                    return (
                        created.getFullYear() === y &&
                        created.getMonth() === m - 1
                    );
                }
                case "year":
                    if (!dateYear) return true;
                    return created.getFullYear() === Number(dateYear);
                case "range":
                    if (!dateFrom && !dateTo) return true;
                    if (
                        dateFrom &&
                        created < new Date(`${dateFrom}T00:00:00`)
                    ) {
                        return false;
                    }
                    if (dateTo && created > new Date(`${dateTo}T23:59:59`)) {
                        return false;
                    }
                    return true;
                default:
                    return true;
            }
        })
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );

    const clearDateFilter = () => {
        setDateMode("all");
        setDateDay("");
        setDateWeek("");
        setDateMonth("");
        setDateYear("");
        setDateFrom("");
        setDateTo("");
    };

    const availableYears = Array.from(
        new Set(orders.map((o) => new Date(o.createdAt).getFullYear())),
    ).sort((a, b) => b - a);
    const yearOptions =
        availableYears.length > 0 ? availableYears : [new Date().getFullYear()];

    const isDateFilterActive =
        dateMode !== "all" &&
        ((dateMode === "day" && !!dateDay) ||
            (dateMode === "week" && !!dateWeek) ||
            (dateMode === "month" && !!dateMonth) ||
            (dateMode === "year" && !!dateYear) ||
            (dateMode === "range" && !!(dateFrom || dateTo)));

    const countFor = (t: FilterTab) =>
        t === "all"
            ? orders.length
            : orders.filter((o) => o.status === t).length;

    const pageSize =
        viewMode === "list" ? LIST_PAGE_SIZE : CARD_PAGE_SIZE[cardSize];
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );
    const rangeStart =
        filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const rangeEnd = Math.min(safePage * pageSize, filtered.length);

    // Reset to page 1 whenever the result set or the page size changes.
    useEffect(() => {
        setCurrentPage(1);
    }, [
        tab,
        search,
        dateMode,
        dateDay,
        dateWeek,
        dateMonth,
        dateYear,
        dateFrom,
        dateTo,
        viewMode,
        cardSize,
    ]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Orders
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    All customer orders. Update status and assign drivers.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-white p-1">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`rounded-[4px] px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                                tab === t
                                    ? "bg-crate text-white"
                                    : "text-ink/60 hover:text-ink"
                            }`}
                        >
                            {t === "all" ? "All" : STATUS_LABELS[t]}
                            <span
                                className={`ml-1.5 text-xs ${tab === t ? "text-white/70" : "text-ink/40"}`}
                            >
                                {countFor(t)}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
                            strokeWidth={1.75}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer, order ID, email"
                            className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate sm:w-72"
                        />
                    </div>

                    <button
                        onClick={() => setShowDateFilter((v) => !v)}
                        className={`relative flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                            showDateFilter
                                ? "border-crate bg-crate text-white"
                                : "border-ink/20 bg-white text-ink/70 hover:text-ink"
                        }`}
                    >
                        <SlidersHorizontal
                            className="h-4 w-4"
                            strokeWidth={1.75}
                        />
                        Filter
                        {isDateFilterActive && !showDateFilter && (
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-signal" />
                        )}
                    </button>
                </div>
            </div>

            {/* Date filter + view switcher, side by side */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                {showDateFilter && (
                    <div className="rounded-lg border border-ink/10 bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1.5 text-sm text-ink/50">
                                <Filter
                                    className="h-4 w-4"
                                    strokeWidth={1.75}
                                />
                                Filter by
                            </span>
                            <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-kraft/30 p-1">
                                {DATE_MODES.map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setDateMode(m.value)}
                                        className={`rounded-[4px] px-2.5 py-1 text-xs font-medium transition-colors ${
                                            dateMode === m.value
                                                ? "bg-crate text-white"
                                                : "text-ink/60 hover:text-ink"
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {dateMode === "day" && (
                                <input
                                    type="date"
                                    value={dateDay}
                                    onChange={(e) => setDateDay(e.target.value)}
                                    className="w-fit rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-1.5 text-sm text-ink outline-none transition focus:border-crate"
                                />
                            )}

                            {dateMode === "week" && (
                                <input
                                    type="week"
                                    value={dateWeek}
                                    onChange={(e) =>
                                        setDateWeek(e.target.value)
                                    }
                                    className="w-fit rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-1.5 text-sm text-ink outline-none transition focus:border-crate"
                                />
                            )}

                            {dateMode === "month" && (
                                <input
                                    type="month"
                                    value={dateMonth}
                                    onChange={(e) =>
                                        setDateMonth(e.target.value)
                                    }
                                    className="w-fit rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-1.5 text-sm text-ink outline-none transition focus:border-crate"
                                />
                            )}

                            {dateMode === "year" && (
                                <select
                                    value={dateYear}
                                    onChange={(e) =>
                                        setDateYear(e.target.value)
                                    }
                                    className="w-fit rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-1.5 text-sm text-ink outline-none transition focus:border-crate"
                                >
                                    <option value="">Select a year</option>
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {dateMode === "range" && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        max={dateTo || undefined}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                        className="rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-1.5 text-sm text-ink outline-none transition focus:border-crate"
                                    />
                                    <span className="text-sm text-ink/40">
                                        to
                                    </span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        min={dateFrom || undefined}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                        className="rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-1.5 text-sm text-ink outline-none transition focus:border-crate"
                                    />
                                </div>
                            )}

                            {isDateFilterActive && (
                                <button
                                    onClick={clearDateFilter}
                                    className="flex items-center gap-1 text-sm text-ink/50 hover:text-ink"
                                >
                                    <X
                                        className="h-3.5 w-3.5"
                                        strokeWidth={1.75}
                                    />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* View switcher */}
                <div className="flex items-center gap-2 sm:ml-auto">
                    <div className="flex gap-1 rounded-md border border-ink/10 bg-white p-1">
                        <button
                            onClick={() => setViewMode("list")}
                            title="List view"
                            className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-sm font-medium transition-colors ${
                                viewMode === "list"
                                    ? "bg-crate text-white"
                                    : "text-ink/60 hover:text-ink"
                            }`}
                        >
                            <List className="h-4 w-4" strokeWidth={1.75} />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            title="Card view"
                            className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-sm font-medium transition-colors ${
                                viewMode === "card"
                                    ? "bg-crate text-white"
                                    : "text-ink/60 hover:text-ink"
                            }`}
                        >
                            <LayoutGrid
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                            Card
                        </button>
                    </div>

                    {viewMode === "card" && (
                        <div className="flex gap-1 rounded-md border border-ink/10 bg-white p-1">
                            {(["small", "medium", "large"] as CardSize[]).map(
                                (size) => (
                                    <button
                                        key={size}
                                        onClick={() => setCardSize(size)}
                                        title={`${size[0].toUpperCase()}${size.slice(1)} cards`}
                                        className={`rounded-[4px] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                            cardSize === size
                                                ? "bg-crate text-white"
                                                : "text-ink/60 hover:text-ink"
                                        }`}
                                    >
                                        {size[0].toUpperCase()}
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/50 p-10 text-center">
                    <Package
                        className="mx-auto h-8 w-8 text-ink/30"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/60">
                        No orders match this view.
                    </p>
                </div>
            ) : viewMode === "list" ? (
                <div className="space-y-3">
                    {paginated.map((order) => (
                        <button
                            key={order._id}
                            onClick={() =>
                                navigate(`/manager/orders/${order._id}`)
                            }
                            className="flex w-full items-center justify-between rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
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

                                <p className="mt-2 truncate font-medium text-ink">
                                    {customerName(order)}
                                </p>

                                <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink/60">
                                    <MapPin
                                        className="h-3.5 w-3.5 shrink-0"
                                        strokeWidth={1.75}
                                    />
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.province}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink/50">
                                    <span>{order.items.length} item(s)</span>
                                    <span className="font-medium text-ink/70">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Truck
                                            className="h-3.5 w-3.5"
                                            strokeWidth={1.75}
                                        />
                                        {driverName(order)}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-ink/30" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className={`grid gap-3 ${CARD_GRID_CLASS[cardSize]}`}>
                    {paginated.map((order) => (
                        <button
                            key={order._id}
                            onClick={() =>
                                navigate(`/manager/orders/${order._id}`)
                            }
                            className={`flex flex-col rounded-lg border border-ink/10 bg-white text-left shadow-sm transition-shadow hover:shadow-md ${
                                cardSize === "small"
                                    ? "gap-1.5 p-3"
                                    : cardSize === "medium"
                                      ? "gap-2 p-4"
                                      : "gap-3 p-5"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                                    style={{
                                        backgroundColor:
                                            STATUS_COLORS[order.status],
                                    }}
                                >
                                    {STATUS_LABELS[order.status]}
                                </span>
                                <span className="font-mono text-[10px] text-ink/40">
                                    #{order._id.slice(-6).toUpperCase()}
                                </span>
                            </div>

                            <p
                                className={`truncate font-medium text-ink ${
                                    cardSize === "large" ? "text-lg" : "text-sm"
                                }`}
                            >
                                {customerName(order)}
                            </p>

                            {cardSize !== "small" && (
                                <p className="flex items-center gap-1 truncate text-xs text-ink/60">
                                    <MapPin
                                        className="h-3.5 w-3.5 shrink-0"
                                        strokeWidth={1.75}
                                    />
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.province}
                                </p>
                            )}

                            {cardSize === "large" && (
                                <p className="text-xs text-ink/40">
                                    {formatDateTime(order.createdAt)}
                                </p>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-1 text-xs text-ink/50">
                                <span>{order.items.length} item(s)</span>
                                <span className="font-medium text-ink/80">
                                    {formatPrice(order.totalAmount)}
                                </span>
                            </div>

                            {cardSize !== "small" && (
                                <div className="flex items-center gap-1 text-xs text-ink/50">
                                    <Truck
                                        className="h-3.5 w-3.5"
                                        strokeWidth={1.75}
                                    />
                                    {driverName(order)}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length > 0 && totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-4 sm:flex-row">
                    <p className="text-xs text-ink/50">
                        Showing {rangeStart}–{rangeEnd} of {filtered.length}{" "}
                        order{filtered.length === 1 ? "" : "s"}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={safePage === 1}
                            className="bg-white flex items-center gap-1 rounded-md border border-ink/15 px-2.5 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-crate hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                            Prev
                        </button>
                        <span className="px-2 text-sm text-ink/60">
                            Page {safePage} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1),
                                )
                            }
                            disabled={safePage === totalPages}
                            className=" bg-white flex items-center gap-1 rounded-md border border-ink/15 px-2.5 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-crate hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
