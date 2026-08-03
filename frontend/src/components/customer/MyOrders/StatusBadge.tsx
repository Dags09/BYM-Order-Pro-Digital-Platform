import { ORDER_STATUS_CONFIG } from "../../../utils/constants";
import type { OrderStatus } from "../../../utils/constants";

interface StatusBadgeProps {
    status: OrderStatus | string;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const s = ORDER_STATUS_CONFIG[status as OrderStatus] ?? {
        bg: "bg-gray-100",
        text: "text-gray-600",
        dot: "bg-gray-400",
        label: status,
    };
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

export { StatusBadge };
