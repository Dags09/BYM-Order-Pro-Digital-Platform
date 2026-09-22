import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import useCartStore from "../../../../store/cartStore";
import { formatPrice } from "../../../../utils/formatters";
import { RESTORE_DELAY_MS } from "../../../../utils/formatters";

export default function CartDropdown() {
    const navigate = useNavigate();
    const { items, removeItem, updateQuantity, totalItems, totalPrice } =
        useCartStore();

    const [cartOpen, setCartOpen] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);

    const [displayQty, setDisplayQty] = useState<Record<string, string>>({});
    const pendingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
        {},
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cartRef.current &&
                !cartRef.current.contains(event.target as Node)
            ) {
                setCartOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            Object.values(pendingTimers.current).forEach(clearTimeout);
        };
    }, []);

    const clearPendingTimer = (productId: string) => {
        const existing = pendingTimers.current[productId];
        if (existing) {
            clearTimeout(existing);
            delete pendingTimers.current[productId];
        }
    };

    const clearOverride = (productId: string) => {
        setDisplayQty((prev) => {
            if (!(productId in prev)) return prev;
            const next = { ...prev };
            delete next[productId];
            return next;
        });
    };

    const scheduleDecrease = (productId: string, newQuantity: number) => {
        clearPendingTimer(productId);
        setDisplayQty((prev) => ({
            ...prev,
            [productId]: String(Math.max(newQuantity, 0)),
        }));
        pendingTimers.current[productId] = setTimeout(() => {
            updateQuantity(productId, newQuantity);
            delete pendingTimers.current[productId];
            clearOverride(productId);
        }, RESTORE_DELAY_MS);
    };

    const commitNow = (productId: string, newQuantity: number) => {
        clearPendingTimer(productId);
        updateQuantity(productId, newQuantity);
        clearOverride(productId);
    };

    const handleDecreaseClick = (productId: string, currentQty: number) => {
        scheduleDecrease(productId, currentQty - 1);
    };

    const handleIncreaseClick = (productId: string, currentQty: number) => {
        commitNow(productId, currentQty + 1);
    };

    const handleInputChange = (
        productId: string,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const raw = e.target.value;
        if (raw === "" || /^\d+$/.test(raw)) {
            setDisplayQty((prev) => ({ ...prev, [productId]: raw }));
        }
    };

    const handleInputBlur = (productId: string, currentQty: number) => {
        const raw = displayQty[productId];
        if (raw === undefined) return;

        const parsed = parseInt(raw, 10);
        if (isNaN(parsed) || parsed < 0) {
            clearOverride(productId);
            return;
        }

        if (parsed >= currentQty) {
            commitNow(productId, parsed);
        } else {
            scheduleDecrease(productId, parsed);
        }
    };

    const handleRemove = (productId: string) => {
        clearPendingTimer(productId);
        clearOverride(productId);
        removeItem(productId);
    };

    return (
        <div className="relative" ref={cartRef}>
            <button
                type="button"
                onClick={() => setCartOpen((v) => !v)}
                aria-label="Open cart"
                className="relative rounded bg-signal p-2.5 text-ink transition hover:bg-signal-dark"
            >
                <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2.5} />
                {totalItems() > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-crate bg-route font-mono text-[10px] font-bold text-kraft">
                        {totalItems()}
                    </span>
                )}
            </button>

            {cartOpen && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border-2 border-ink bg-white text-ink shadow-[4px_4px_0_0_theme(colors.ink)]">
                    <div className="border-b border-dashed border-ink/25 px-4 py-3">
                        <p className="font-display text-sm font-semibold">
                            Your cart
                        </p>
                    </div>

                    {items.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-ink/50">
                            No items yet.
                        </p>
                    ) : (
                        <ul className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
                            {items.map((item) => {
                                const inputValue =
                                    displayQty[item.productId] ??
                                    String(item.quantity);

                                return (
                                    <li
                                        key={item.productId}
                                        className="flex items-center justify-between gap-3 text-sm"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {item.name}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="flex items-center rounded border border-ink/20">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDecreaseClick(
                                                                item.productId,
                                                                item.quantity,
                                                            )
                                                        }
                                                        aria-label={`Decrease quantity of ${item.name}`}
                                                        className="px-1.5 py-0.5 text-ink/60 transition hover:text-ink"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={inputValue}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                item.productId,
                                                                e,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            handleInputBlur(
                                                                item.productId,
                                                                item.quantity,
                                                            )
                                                        }
                                                        aria-label={`Quantity of ${item.name}`}
                                                        className="w-8 border-x border-ink/20 bg-transparent py-0.5 text-center font-mono text-xs text-ink outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleIncreaseClick(
                                                                item.productId,
                                                                item.quantity,
                                                            )
                                                        }
                                                        aria-label={`Increase quantity of ${item.name}`}
                                                        className="px-1.5 py-0.5 text-ink/60 transition hover:text-ink"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <span className="font-mono text-xs text-ink/50">
                                                    × {formatPrice(item.price)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemove(item.productId)
                                            }
                                            aria-label={`Remove ${item.name}`}
                                            className="shrink-0 text-ink/40 transition hover:text-route"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {items.length > 0 && (
                        <div className="border-t-2 border-ink px-4 py-3">
                            <div className="flex items-center justify-between">
                                <span className="font-display text-sm font-semibold">
                                    Total
                                </span>
                                <span className="font-mono text-base font-semibold text-crate">
                                    {formatPrice(totalPrice())}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setCartOpen(false);
                                    navigate("/cart");
                                }}
                                className="mt-3 w-full rounded bg-crate py-2 text-sm font-semibold text-kraft transition hover:bg-crate-dark"
                            >
                                View cart
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
