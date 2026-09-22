import { Minus, Plus, Trash2 } from "lucide-react";
import useCartStore from "../../../../store/cartStore";
import { formatPrice } from "../../../../utils/formatters";
import { useCartLineItem } from "../../../../hooks/useCartLineItem";
import type { CartItemRowProps } from "../../../../types/carts";

export default function CartItemRow({
    item,
    compact = false,
}: CartItemRowProps) {
    const removeItem = useCartStore((state) => state.removeItem);
    const {
        inputValue,
        handleIncrease,
        handleDecrease,
        handleChange,
        handleBlur,
    } = useCartLineItem(item.productId, item.quantity);

    const stepper = (
        <div
            className={`flex items-center rounded border-ink/20 ${
                compact ? "border" : "rounded-md border-2"
            }`}
        >
            <button
                type="button"
                onClick={handleDecrease}
                aria-label={`Decrease quantity of ${item.name}`}
                className={`text-ink/60 transition hover:text-ink ${
                    compact ? "px-1.5 py-0.5" : "px-2 py-1.5"
                }`}
            >
                <Minus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </button>
            <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                aria-label={`Quantity of ${item.name}`}
                className={`bg-transparent text-center font-mono text-ink outline-none ${
                    compact
                        ? "w-8 border-x border-ink/20 py-0.5 text-xs"
                        : "w-10 border-x-2 border-ink/20 py-1.5 text-sm"
                }`}
            />
            <button
                type="button"
                onClick={handleIncrease}
                aria-label={`Increase quantity of ${item.name}`}
                className={`text-ink/60 transition hover:text-ink ${
                    compact ? "px-1.5 py-0.5" : "px-2 py-1.5"
                }`}
            >
                <Plus className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </button>
        </div>
    );

    if (compact) {
        return (
            <li className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                        {stepper}
                        <span className="font-mono text-xs text-ink/50">
                            × {formatPrice(item.price)}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name}`}
                    className="shrink-0 text-ink/40 transition hover:text-route"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </li>
        );
    }

    return (
        <li className="flex items-center gap-4 border-b border-dashed border-ink/20 py-4 last:border-b-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-ink bg-kraft-dark/50">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-xl">🏷️</span>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink">
                    {item.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-ink/50">
                    {formatPrice(item.price)} per case
                </p>
            </div>

            {stepper}

            <p className="w-20 shrink-0 text-right font-mono text-sm font-semibold text-crate">
                {formatPrice(item.price * item.quantity)}
            </p>

            <button
                type="button"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.name}`}
                className="shrink-0 text-ink/40 transition hover:text-route"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </li>
    );
}
