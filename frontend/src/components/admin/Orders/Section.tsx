import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface SectionProps {
    title: string;
    icon: IconDefinition;
    children: ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <FontAwesomeIcon
                    icon={icon}
                    className="text-slate-400 text-sm"
                />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {title}
                </p>
            </div>
            {children}
        </div>
    );
}

export { Section };
