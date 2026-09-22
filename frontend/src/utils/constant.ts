import { Truck, PackageCheck, ClipboardList } from "lucide-react";

export const steps = [
    {
        icon: ClipboardList,
        title: "Place your order",
        description:
            "Browse the catalog and order by the case — no minimum trip to the wholesaler required.",
    },
    {
        icon: PackageCheck,
        title: "We pack it",
        description:
            "Your order is checked against stock and packed the same day it's confirmed.",
    },
    {
        icon: Truck,
        title: "Delivered to your store",
        description:
            "Same-day delivery, straight to your shelves. Pay COD, GCash, or Maya.",
    },
];

export const partners = [
    "Golden Harvest Mills",
    "Pacific Oils Co.",
    "Isla Beverages",
    "Tindahan Foods",
    "Bayanihan Snacks",
    "CleanHome Essentials",
];

export const STATUS_COLORS: Record<string, string> = {
    pending: "#f0b429",
    processing: "#3f8563",
    shipped: "#2f6b4f",
    delivered: "#21503a",
    cancelled: "#c1443d",
};

export const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};
