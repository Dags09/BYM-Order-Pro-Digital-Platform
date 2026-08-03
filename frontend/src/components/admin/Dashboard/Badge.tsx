import { STATUS_COLOR } from "../../../utils/constants";
import type { OrderStatus } from "../../../utils/constants";

interface BadgeProps {
    status: OrderStatus | string;
}

function Badge({ status }: BadgeProps) {
    const s = STATUS_COLOR[status as OrderStatus] ?? {
        bg: "bg-gray-100",
        text: "text-gray-600",
    };
    return (
        <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}
        >
            {status}
        </span>
    );
}

export { Badge };
