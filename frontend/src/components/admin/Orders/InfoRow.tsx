import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface InfoRowProps {
    icon: IconDefinition;
    label: string;
    value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FontAwesomeIcon
                    icon={icon}
                    className="text-slate-400 text-xs"
                />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm text-slate-700 font-medium truncate">
                    {value}
                </p>
            </div>
        </div>
    );
}

export { InfoRow };
