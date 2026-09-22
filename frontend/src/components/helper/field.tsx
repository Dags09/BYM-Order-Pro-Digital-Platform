import type { ChangeEvent, ClipboardEvent } from "react";

interface FieldProps {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    onCopy?: (e: ClipboardEvent<HTMLInputElement>) => void;
    error?: string;
}

export function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    onCopy,
    error,
}: FieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                onCopy={onCopy}
                placeholder={placeholder}
                className={`w-full rounded-md border-2 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition ${
                    error
                        ? "border-route focus:border-route"
                        : "border-ink/20 focus:border-crate"
                }`}
            />
            {error && (
                <p className="mt-1 font-mono text-xs text-route">{error}</p>
            )}
        </div>
    );
}
