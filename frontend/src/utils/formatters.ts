export const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(price);

export const RESTORE_DELAY_MS = 1000;

export function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
    });
}

export function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function isSameDay(dateStr: string, reference: Date = new Date()) {
    const d = new Date(dateStr);
    return (
        d.getFullYear() === reference.getFullYear() &&
        d.getMonth() === reference.getMonth() &&
        d.getDate() === reference.getDate()
    );
}
