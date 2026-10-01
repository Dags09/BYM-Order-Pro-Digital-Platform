import type { LucideIcon } from "lucide-react";
import { Skeleton } from "../../skeletonLoader";

interface StatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    accent?: "crate" | "signal" | "route" | "ink";
    footnote?: string;
    loading?: boolean;
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
    crate: "bg-[var(--color-crate)]/10 text-[var(--color-crate)]",
    signal: "bg-[var(--color-signal)]/15 text-[var(--color-signal-dark)]",
    route: "bg-[var(--color-route)]/10 text-[var(--color-route)]",
    ink: "bg-[var(--color-ink)]/8 text-[var(--color-ink)]",
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    accent = "crate",
    footnote,
    loading = false,
}: StatCardProps) {
    return (
        <div className="rounded-lg border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink)]/50">
                        {label}
                    </p>
                    {loading ? (
                        <Skeleton className="mt-2 h-7 w-24" />
                    ) : (
                        <p className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-semibold text-[var(--color-ink)]">
                            {value}
                        </p>
                    )}
                </div>
                <div className={`rounded-md p-2 ${accentClasses[accent]}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
            </div>
            {loading ? (
                <Skeleton className="mt-3 h-3 w-28" />
            ) : (
                footnote && (
                    <p className="mt-3 text-xs text-[var(--color-ink)]/50">
                        {footnote}
                    </p>
                )
            )}
        </div>
    );
}
