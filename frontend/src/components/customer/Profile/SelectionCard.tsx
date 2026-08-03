import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function SectionCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon
                        icon={icon}
                        className="text-green-700 text-sm"
                    />
                </div>
                <p className="font-semibold text-slate-800">{title}</p>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}
export { SectionCard };
