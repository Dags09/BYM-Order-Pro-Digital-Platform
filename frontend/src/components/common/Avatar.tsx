interface AvatarProps {
    name: string;
    color?: string;
    className?: string;
    isActive?: boolean;
}

const getContrastColor = (hex: string) => {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#111" : "#fff";
};

function Avatar({ name, color, className = "", isActive }: AvatarProps) {
    const initials =
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?";

    const bgColor = color ?? (isActive ? "#16a34a" : "#d1d5db");
    const textColor = getContrastColor(bgColor);

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <span className="font-bold">{initials}</span>
            {typeof isActive === "boolean" && (
                <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isActive ? "bg-emerald-400" : "bg-gray-300"
                    }`}
                />
            )}
        </div>
    );
}

export { Avatar };
