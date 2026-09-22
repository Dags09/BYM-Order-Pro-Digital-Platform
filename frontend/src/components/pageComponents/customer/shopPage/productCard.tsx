import { Minus, Plus, Check } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import type { Product } from "../../../../types/product";
import { formatPrice } from "../../../../utils/formatters";
import { useProductCartControls } from "../../../../hooks/useProductCartControls";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const {
        stockValue,
        outOfStock,
        limitReached,
        maxQty,
        quantity,
        quantityInput,
        added,
        commitQuantity,
        handleQuantityChange,
        handleQuantityBlur,
        handleAdd,
    } = useProductCartControls(product);

    return (
        <div className="flex flex-col rounded-lg border-2 border-ink bg-white shadow-[4px_4px_0_0_theme(colors.ink)]">
            <div className="relative flex h-40 items-center justify-center overflow-hidden border-b-2 border-ink bg-kraft-dark/60">
                <span
                    className={`absolute right-2 top-2 rounded px-2 py-0.5 font-mono text-[10px] text-kraft ${
                        outOfStock
                            ? "bg-route"
                            : limitReached
                              ? "bg-route"
                              : "bg-crate"
                    }`}
                >
                    {outOfStock
                        ? "Out of stock"
                        : limitReached
                          ? "Out of stock"
                          : "In stock"}
                </span>

                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-md bg-white text-2xl">
                        <FontAwesomeIcon icon={faTag} />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <p className="font-display text-sm font-semibold text-ink">
                    {product.name}
                </p>
                {product.category?.name && (
                    <p className="mt-0.5 font-mono text-xs text-ink/50">
                        {product.category.name}
                    </p>
                )}

                <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-ink/20 pt-2">
                    <span className="font-mono text-base font-semibold text-crate">
                        {formatPrice(product.price)}
                    </span>

                    <span className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
                        per case
                    </span>
                </div>
                {!outOfStock && limitReached && (
                    <p
                        className={`mt-1.5 line-clamp-2 h-[15px] overflow-hidden text-right font-mono text-[10px] leading-tight ${
                            limitReached ? "text-route" : "text-ink/40"
                        }`}
                    >
                        {limitReached
                            ? `All ${stockValue} available already in your cart`
                            : !outOfStock && quantity >= maxQty
                              ? `Max ${maxQty} available`
                              : "\u00A0"}
                    </p>
                )}

                <div className="mt-auto pt-3">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border-2 border-ink/20">
                            <button
                                type="button"
                                onClick={() => commitQuantity(quantity - 1)}
                                disabled={outOfStock || limitReached}
                                aria-label="Decrease quantity"
                                className="px-2 py-1.5 text-ink/60 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={quantityInput}
                                onChange={handleQuantityChange}
                                onBlur={handleQuantityBlur}
                                disabled={outOfStock || limitReached}
                                aria-label="Quantity"
                                className="w-10 border-x-2 border-ink/20 bg-transparent py-1.5 text-center font-mono text-sm text-ink outline-none disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                onClick={() => commitQuantity(quantity + 1)}
                                disabled={
                                    outOfStock ||
                                    limitReached ||
                                    quantity >= maxQty
                                }
                                aria-label="Increase quantity"
                                className="px-2 py-1.5 text-ink/60 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={outOfStock || limitReached}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                added
                                    ? "bg-crate text-kraft"
                                    : "bg-signal text-ink hover:bg-signal-dark"
                            }`}
                        >
                            {added ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    Added
                                </>
                            ) : limitReached ? (
                                "All in cart"
                            ) : (
                                "Add to cart"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
