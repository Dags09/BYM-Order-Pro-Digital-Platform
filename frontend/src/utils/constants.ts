import {
    faArrowDownAZ,
    faArrowUpAZ,
    faFire,
    faSortAmountDown,
    faSortAmountUp,
    faUserShield,
    faUserTie,
    faUser,
    faTruck,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

export const ALL_STATUSES: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

interface OrderStatusConfigEntry {
    bg: string;
    text: string;
    dot: string;
    label: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfigEntry> =
    {
        pending: {
            bg: "bg-amber-100",
            text: "text-amber-700",
            dot: "bg-amber-400",
            label: "Pending",
        },
        processing: {
            bg: "bg-blue-100",
            text: "text-blue-700",
            dot: "bg-blue-500",
            label: "Processing",
        },
        shipped: {
            bg: "bg-indigo-100",
            text: "text-indigo-700",
            dot: "bg-indigo-500",
            label: "On the Way",
        },
        delivered: {
            bg: "bg-emerald-100",
            text: "text-emerald-700",
            dot: "bg-emerald-500",
            label: "Delivered",
        },
        cancelled: {
            bg: "bg-red-100",
            text: "text-red-600",
            dot: "bg-red-400",
            label: "Cancelled",
        },
    };

interface StatusConfigEntry {
    color: string;
    bg: string;
    label: string;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfigEntry> = {
    pending: { color: "text-amber-500", bg: "bg-amber-50", label: "Pending" },
    processing: {
        color: "text-blue-500",
        bg: "bg-blue-50",
        label: "Processing",
    },
    shipped: {
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        label: "On the Way",
    },
    delivered: {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        label: "Delivered",
    },
    cancelled: { color: "text-red-500", bg: "bg-red-50", label: "Cancelled" },
};

interface Step {
    key: OrderStatus;
    label: string;
}

export const steps: Step[] = [
    { key: "pending", label: "Order Confirmed" },
    { key: "processing", label: "Being Prepared" },
    { key: "shipped", label: "On the Way" },
    { key: "delivered", label: "Delivered" },
];

export type SortValue =
    | "popular"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc";

interface SortOption {
    value: SortValue;
    label: string;
    icon: IconDefinition;
}

export const SORT_OPTIONS: SortOption[] = [
    { value: "popular", label: "Most Popular", icon: faFire },
    { value: "price_asc", label: "Price: Low to High", icon: faSortAmountUp },
    {
        value: "price_desc",
        label: "Price: High to Low",
        icon: faSortAmountDown,
    },
    { value: "name_asc", label: "Name: A–Z", icon: faArrowUpAZ },
    { value: "name_desc", label: "Name: Z–A", icon: faArrowDownAZ },
];

export interface QrType {
    id: string;
    label: string;
    color: string;
    light: string;
    text: string;
}

export const QR_TYPES: QrType[] = [
    {
        id: "gcash",
        label: "GCash",
        color: "bg-blue-500",
        light: "bg-blue-50",
        text: "text-blue-700",
    },
    {
        id: "maya",
        label: "Maya",
        color: "bg-green-500",
        light: "bg-green-50",
        text: "text-green-700",
    },
];

interface StatusColorEntry {
    bg: string;
    text: string;
    dot: string;
}

export const STATUS_COLOR: Record<OrderStatus, StatusColorEntry> = {
    pending: { bg: "bg-amber-100", text: "text-amber-700", dot: "#f59e0b" },
    processing: { bg: "bg-blue-100", text: "text-blue-700", dot: "#3b82f6" },
    shipped: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "#6366f1" },
    delivered: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "#10b981",
    },
    cancelled: { bg: "bg-red-100", text: "text-red-600", dot: "#ef4444" },
};

export const STOCK_THRESHOLD = 10;

export const PIE_COLORS: string[] = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
];
type PaymentMethod = "cod" | "gcash" | "maya";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    cod: "Cash on Delivery",
    gcash: "GCash",
    maya: "Maya",
};

export const ROLE_STYLE: Record<UserRole, RoleStyleEntry> = {
    customer: { bg: "bg-blue-50", text: "text-blue-700", icon: faUser },
    admin: { bg: "bg-red-50", text: "text-red-700", icon: faUserShield },
    driver: { bg: "bg-amber-50", text: "text-amber-700", icon: faTruck },
    staff: { bg: "bg-green-50", text: "text-green-700", icon: faUserTie },
};

export type UserRole = "customer" | "admin" | "driver" | "staff";

interface RoleStyleEntry {
    bg: string;
    text: string;
    icon: IconDefinition;
}
