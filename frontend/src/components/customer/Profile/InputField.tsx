import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type InputFieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    icon?: any;
    rightSlot?: React.ReactNode;
};

// ── helpers ───────────────────────────────────────────────────────────────────
function InputField({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
    disabled,
    icon,
    rightSlot,
}: InputFieldProps) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <FontAwesomeIcon
                        icon={icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm pointer-events-none"
                    />
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm text-slate-700
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition
                        ${icon ? "pl-9" : "pl-3"} ${rightSlot ? "pr-10" : "pr-3"}
                        ${disabled ? "bg-gray-50 text-slate-400 cursor-not-allowed" : "bg-white"}`}
                />
                {rightSlot && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightSlot}
                    </div>
                )}
            </div>
        </div>
    );
}
export { InputField };
