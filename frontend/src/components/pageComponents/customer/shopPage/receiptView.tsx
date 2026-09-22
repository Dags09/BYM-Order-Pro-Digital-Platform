import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../../../utils/formatters";
import type { Receipt } from "../../../../types/order";

export function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
            />
        </div>
    );
}

export function ReceiptView({ receipt }: { receipt: Receipt }) {
    return (
        <div className="mx-auto max-w-md py-8 text-center">
            <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-crate text-kraft">
                    <CheckCircle2 className="h-7 w-7" />
                </div>
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.25em] text-crate">
                Order confirmed
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                Thanks, {receipt.customerName.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-sm text-ink/60">
                Your order has been placed and is being processed.
            </p>

            <div className="mt-8 rounded-lg border-2 border-ink bg-white p-6 text-left shadow-[6px_6px_0_0_theme(colors.crate)]">
                <div className="flex items-center justify-between border-b border-dashed border-ink/25 pb-3">
                    <span className="font-mono text-xs text-ink/50">
                        ORDER #{receipt.orderId.slice(-6).toUpperCase()}
                    </span>
                    <span className="rounded border-2 border-route bg-kraft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-route">
                        {receipt.status}
                    </span>
                </div>

                <ul className="mt-4 space-y-3">
                    {receipt.items.map((item, i) => (
                        <li
                            key={i}
                            className="flex items-center justify-between text-sm"
                        >
                            <div>
                                <p className="font-medium text-ink">
                                    {item.product}
                                </p>
                                <p className="font-mono text-xs text-ink/50">
                                    x{item.quantity}
                                </p>
                            </div>
                            <span className="font-mono text-sm text-ink">
                                {formatPrice(item.subtotal)}
                            </span>
                        </li>
                    ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t-2 border-ink pt-3">
                    <span className="font-display text-sm font-semibold text-ink">
                        Total
                    </span>
                    <span className="font-mono text-lg font-semibold text-crate">
                        {formatPrice(receipt.totalAmount)}
                    </span>
                </div>

                {receipt.note && (
                    <p className="mt-4 border-t border-dashed border-ink/20 pt-3 font-mono text-xs text-ink/50">
                        Note: {receipt.note}
                    </p>
                )}
            </div>

            <div className="mt-8 flex justify-center gap-3">
                <Link
                    to="/shop"
                    className="rounded-md border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-kraft"
                >
                    Continue shopping
                </Link>
                <Link
                    to="/home"
                    className="rounded-md bg-crate px-6 py-2.5 text-sm font-semibold text-kraft transition hover:bg-crate-dark"
                >
                    Back home
                </Link>
            </div>
        </div>
    );
}
