import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
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
import type { Order, OrderStatus } from "../../types/order";
import type { Product } from "../../types/product";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constant";

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

function ChartCard({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle: string;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-[var(--color-ink)]/10 bg-white p-5">
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                {title}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-ink)]/50">
                {subtitle}
            </p>
            <div className="mt-4 h-56">{children}</div>
        </div>
    );
}

export default function ManagerDashboardPage() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [products, setProducts] = useState<Product[] | null>(null);
    const [chartsError, setChartsError] = useState<string | null>(null);

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

    const orderStatusData = ORDER_STATUSES.map((status) => ({
        status,
        label: STATUS_LABELS[status],
        count: orders?.filter((o) => o.status === status).length ?? 0,
        color: STATUS_COLORS[status],
    }));

    const deliveryStatusData = DELIVERY_STATUSES.map(({ status, label }) => ({
        status,
        label,
        count:
            orders?.filter((o) => o.driver && o.status === status).length ?? 0,
        color: STATUS_COLORS[status],
    }));

    const stockData = products
        ? [
              {
                  label: "Out of stock",
                  count: products.filter((p) => p.stock === 0).length,
                  color: STOCK_COLORS.out,
              },
              {
                  label: "Low stock",
                  count: products.filter((p) => p.stock > 0 && p.stock <= 5)
                      .length,
                  color: STOCK_COLORS.low,
              },
              {
                  label: "In stock",
                  count: products.filter((p) => p.stock > 5).length,
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
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ChartCard
                        title="Orders by status"
                        subtitle="All orders, current status"
                    >
                        {chartsLoading ? (
                            <ChartSkeleton />
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
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                        subtitle="Out of stock, low (≤5), and healthy"
                    >
                        {chartsLoading ? (
                            <ChartSkeleton />
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
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                    >
                        {chartsLoading ? (
                            <ChartSkeleton />
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
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
            )}
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-crate border-t-transparent" />
        </div>
    );
}
