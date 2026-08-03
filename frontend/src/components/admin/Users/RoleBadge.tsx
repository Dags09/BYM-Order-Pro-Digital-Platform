import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ROLE_STYLE } from "../../../utils/constants";
import type { UserRole } from "../../../utils/constants";

interface RoleBadgeProps {
    role: UserRole | string;
}

function RoleBadge({ role }: RoleBadgeProps) {
    const s = ROLE_STYLE[role as UserRole] ?? ROLE_STYLE.customer;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}
        >
            <FontAwesomeIcon icon={s.icon} className="text-[10px]" />
            {role}
        </span>
    );
}

export { RoleBadge };
