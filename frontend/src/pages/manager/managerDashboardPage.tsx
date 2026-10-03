import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Package, Tags, ClipboardList, Truck } from "lucide-react";
import useAuthStore from "../../store/authStore";
import api from "../../lib/axios";
import { ManagerDashboardChartSkeleton } from "../../components/pageComponents/manager/managerSkeletons";
import type { Order, OrderStatus } from "../../types/order";
import type { Product } from "../../types/product";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

type DateRangePreset = "all" | "today" | "week" | "month" | "year" | "custom";

interface DateRange {
    from: Date;
    to: Date;
}

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
    { value: "custom", label: "Custom" },
];

interface DashboardCard {
    name: string;
    description: string;
    icon: typeof Package;
    path?: string;
}

const cards: DashboardCard[] = [
    {
        name: "Orders",
        description: "View all orders and update their status.",
        icon: ClipboardList,
        path: "/manager/orders",
    },
    {
        name: "Products",
        description: "Create, edit, and restock products.",
        icon: Package,
        path: "/manager/products",
    },
    {
        name: "Categories",
        description: "Create, edit, and remove categories.",
        icon: Tags,
        path: "/manager/categories",
    },
    {
        name: "Drivers",
        description: "Assign a driver to an order.",
        icon: Truck,
        path: "/manager/drivers",
    },
];

const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

// Deliveries = orders that actually have a driver on them. "Processing"
// here means assigned but not yet picked up.
const DELIVERY_STATUSES: { status: OrderStatus; label: string }[] = [
    { status: "processing", label: "Awaiting pickup" },
    { status: "shipped", label: "In transit" },
    { status: "delivered", label: "Delivered" },
];

const STOCK_COLORS = {
    out: "#c1443d",
    low: "#f0b429",
    healthy: "#3f8563",
};

const STOCK_FILTERS_BY_LABEL: Record<string, string> = {
    "Out of stock": "out-of-stock",
    "Low stock": "low-stock",
    "In stock": "in-stock",
};

// Used as the lower bound for "All time" so every record passes the
// isInDateRange check regardless of how old it is.
const EPOCH = new Date(0);

function ChartCard({
    title,
    subtitle,
    total,
    loading,
    children,
}: {
    title: string;
    subtitle: string;
    total: number;
    loading: boolean;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-[var(--color-ink)]/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                        {title}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink)]/50">
                        {subtitle}
                    </p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink/45">
                        Total
                    </p>
                    <p className="font-mono text-lg font-semibold leading-tight text-ink">
                        {loading ? "—" : total}
                    </p>
                </div>
            </div>

            <div className="mt-4 h-56">{children}</div>
        </div>
    );
}

function DateFilter({
    value,
    onChange,
    customFrom,
    customTo,
    onCustomFromChange,
    onCustomToChange,
}: {
    value: DateRangePreset;
    onChange: (value: DateRangePreset) => void;
    customFrom: string;
    customTo: string;
    onCustomFromChange: (value: string) => void;
    onCustomToChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
            <select
                value={value}
                onChange={(event) =>
                    onChange(event.target.value as DateRangePreset)
                }
                className="w-full rounded-md border border-[var(--color-ink)]/15 bg-white px-2 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-crate-light)] sm:w-auto"
                aria-label="Chart date range"
            >
                {DATE_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {value === "custom" && (
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
                    <span className="hidden text-xs text-[var(--color-ink)]/50 sm:block">
                        From
                    </span>
                    <input
                        type="date"
                        value={customFrom}
                        onChange={(event) =>
                            onCustomFromChange(event.target.value)
                        }
                        className="w-full min-w-0 rounded-md bg-white border border-[var(--color-ink)]/15 px-2 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-crate-light)]"
                        aria-label="Chart start date"
                    />
                    <span className="hidden text-xs text-[var(--color-ink)]/50 sm:block">
                        To
                    </span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={(event) =>
                            onCustomToChange(event.target.value)
                        }
                        className="w-full min-w-0 rounded-md bg-white border border-[var(--color-ink)]/15 px-2 py-1.5 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-crate-light)]"
                        aria-label="Chart end date"
                    />
                </div>
            )}
        </div>
    );
}

function getDateRange(
    preset: DateRangePreset,
    customFrom: string,
    customTo: string,
): DateRange {
    const today = new Date();
    const to = new Date(today);
    to.setHours(23, 59, 59, 999);

    if (preset === "all") {
        return { from: EPOCH, to };
    }

    if (preset === "custom") {
        const from = customFrom ? new Date(`${customFrom}T00:00:00`) : today;
        const customEnd = customTo ? new Date(`${customTo}T23:59:59.999`) : to;
        return { from, to: customEnd >= from ? customEnd : from };
    }

    const from = new Date(today);
    if (preset === "today") {
        from.setHours(0, 0, 0, 0);
    } else if (preset === "week") {
        from.setHours(0, 0, 0, 0);
        from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
    } else if (preset === "month") {
        from.setHours(0, 0, 0, 0);
        from.setDate(1);
    } else {
        from.setHours(0, 0, 0, 0);
        from.setMonth(0, 1);
    }

    return { from, to };
}

function isInDateRange(value: string | undefined, range: DateRange): boolean {
    if (!value) return false;
    const date = new Date(value);
    return date >= range.from && date <= range.to;
}

export default function ManagerDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [products, setProducts] = useState<Product[] | null>(null);
    const [chartsError, setChartsError] = useState<string | null>(null);
    // One shared filter applies to all three charts below.
    const [dateRange, setDateRange] = useState<DateRangePreset>("today");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    useEffect(() => {
        Promise.all([
            api.get("/order/get-all-orders"),
            api.get("/product/get-all-products"),
        ])
            .then(([ordersRes, productsRes]) => {
                setOrders(ordersRes.data);
                setProducts(productsRes.data);
            })
            .catch(() => setChartsError("Couldn't load dashboard charts."));
    }, []);

    const range = getDateRange(dateRange, customFrom, customTo);
    const ordersInRange = orders?.filter((order) =>
        isInDateRange(order.createdAt, range),
    );
    const productsForStock = products?.filter((product) =>
        isInDateRange(product.createdAt, range),
    );

    const orderStatusData = ORDER_STATUSES.map((status) => ({
        status,
        label: STATUS_LABELS[status],
        count: ordersInRange?.filter((o) => o.status === status).length ?? 0,
        color: STATUS_COLORS[status],
    }));

    const deliveryStatusData = DELIVERY_STATUSES.map(({ status, label }) => ({
        status,
        label,
        count:
            ordersInRange?.filter((o) => o.driver && o.status === status)
                .length ?? 0,
        color: STATUS_COLORS[status],
    }));

    const stockData = productsForStock
        ? [
              {
                  label: "Out of stock",
                  count: productsForStock.filter((p) => p.stock === 0).length,
                  color: STOCK_COLORS.out,
              },
              {
                  label: "Low stock",
                  count: productsForStock.filter(
                      (p) => p.stock > 0 && p.stock <= 5,
                  ).length,
                  color: STOCK_COLORS.low,
              },
              {
                  label: "In stock",
                  count: productsForStock.filter((p) => p.stock > 5).length,
                  color: STOCK_COLORS.healthy,
              },
          ]
        : [];

    const chartsLoading = orders === null || products === null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Welcome{user?.firstName ? `, ${user.firstName}` : ""}
                </h1>
                <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                    This is your manager console.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const content = (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-crate-light)]/10">
                                    <Icon
                                        className="h-4 w-4 text-[var(--color-crate-light)]"
                                        strokeWidth={1.75}
                                    />
                                </div>
                                {!card.path && (
                                    <span className="rounded-full border border-[var(--color-ink)]/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--color-ink)]/40">
                                        Soon
                                    </span>
                                )}
                            </div>
                            <p className="mt-4 font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                                {card.name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-ink)]/50">
                                {card.description}
                            </p>
                        </>
                    );

                    if (card.path) {
                        return (
                            <Link
                                key={card.name}
                                to={card.path}
                                className="rounded-lg border border-[var(--color-ink)]/10 bg-white p-5 transition-shadow hover:shadow-md"
                            >
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={card.name}
                            className="rounded-lg border border-[var(--color-ink)]/10 bg-white p-5"
                        >
                            {content}
                        </div>
                    );
                })}
            </div>

            {chartsError && (
                <div className="mt-6 rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {chartsError}
                </div>
            )}

            {!chartsError && (
                <>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-[var(--color-ink)]/50">
                            Showing data for the selected period
                        </p>
                        <DateFilter
                            value={dateRange}
                            onChange={setDateRange}
                            customFrom={customFrom}
                            customTo={customTo}
                            onCustomFromChange={setCustomFrom}
                            onCustomToChange={setCustomTo}
                        />
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <ChartCard
                            title="Orders"
                            subtitle="All orders, current status"
                            total={orderStatusData
                                .filter((item) => item.status !== "cancelled")
                                .reduce((sum, item) => sum + item.count, 0)}
                            loading={chartsLoading}
                        >
                            {chartsLoading ? (
                                <ManagerDashboardChartSkeleton />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={orderStatusData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#00000010"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11 }}
                                            interval={0}
                                            angle={-20}
                                            textAnchor="end"
                                            height={50}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 11 }}
                                            width={28}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="count"
                                            radius={[4, 4, 0, 0]}
                                            cursor="pointer"
                                            onClick={(entry) => {
                                                const status = entry.payload
                                                    ?.status as
                                                    | OrderStatus
                                                    | undefined;
                                                if (status) {
                                                    navigate(
                                                        `/manager/orders?status=${status}`,
                                                    );
                                                }
                                            }}
                                        >
                                            {orderStatusData.map((d) => (
                                                <Cell
                                                    key={d.status}
                                                    fill={d.color}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        <ChartCard
                            title="Product stock"
                            subtitle="Products added in the selected period"
                            total={stockData.reduce(
                                (sum, item) => sum + item.count,
                                0,
                            )}
                            loading={chartsLoading}
                        >
                            {chartsLoading ? (
                                <ManagerDashboardChartSkeleton />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stockData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#00000010"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 11 }}
                                            width={28}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="count"
                                            radius={[4, 4, 0, 0]}
                                            cursor="pointer"
                                            onClick={(entry) => {
                                                const label = entry.payload
                                                    ?.label as
                                                    | string
                                                    | undefined;
                                                const stockFilter = label
                                                    ? STOCK_FILTERS_BY_LABEL[
                                                          label
                                                      ]
                                                    : undefined;
                                                if (stockFilter) {
                                                    navigate(
                                                        `/manager/products?stock=${stockFilter}`,
                                                    );
                                                }
                                            }}
                                        >
                                            {stockData.map((d) => (
                                                <Cell
                                                    key={d.label}
                                                    fill={d.color}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        <ChartCard
                            title="Deliveries in progress"
                            subtitle="Orders with a driver assigned"
                            total={deliveryStatusData.reduce(
                                (sum, item) => sum + item.count,
                                0,
                            )}
                            loading={chartsLoading}
                        >
                            {chartsLoading ? (
                                <ManagerDashboardChartSkeleton />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deliveryStatusData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#00000010"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11 }}
                                            interval={0}
                                            angle={-20}
                                            textAnchor="end"
                                            height={50}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 11 }}
                                            width={28}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="count"
                                            radius={[4, 4, 0, 0]}
                                            cursor="pointer"
                                            onClick={(entry) => {
                                                const status = entry.payload
                                                    ?.status as
                                                    | OrderStatus
                                                    | undefined;
                                                if (status) {
                                                    navigate(
                                                        `/manager/orders?status=${status}&assigned=1`,
                                                    );
                                                }
                                            }}
                                        >
                                            {deliveryStatusData.map((d) => (
                                                <Cell
                                                    key={d.status}
                                                    fill={d.color}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>
                    </div>
                </>
            )}
        </div>
    );
}
