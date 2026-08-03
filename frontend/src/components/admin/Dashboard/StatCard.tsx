import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon?: IconDefinition | ReactNode;
    iconClassName?: string;
}

function StatCard({ label, value, sub, icon, iconClassName }: StatCardProps) {
    const isFA = icon && typeof icon === "object" && "iconName" in icon;
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-gray-50 ${iconClassName || ""}`}
            >
                {isFA ? (
                    <FontAwesomeIcon icon={icon as IconDefinition} />
                ) : (
                    (icon as ReactNode)
                )}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                    {label}
                </p>
                <p className="text-2xl font-bold text-slate-800 leading-none">
                    {value}
                </p>
                {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}
export { StatCard };
