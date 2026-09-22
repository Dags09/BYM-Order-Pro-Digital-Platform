import { Minus, Plus, Check } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import type { Product } from "../../../../types/product";
import { formatPrice } from "../../../../utils/formatters";
import { useProductCartControls } from "../../../../hooks/useProductCartControls";

interface ProductListItemProps {
    product: Product;
}

export default function ProductListItem({ product }: ProductListItemProps) {
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

    const stockLabel = outOfStock || limitReached ? "Out of stock" : "In stock";

    return (
        <div className="flex flex-col gap-3 border-b-2 border-ink/10 bg-white p-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            {/* Thumbnail + name/category — always shown together */}
            <div className="flex min-w-0 items-center gap-3 sm:w-64 sm:flex-shrink-0">
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-ink bg-kraft-dark/60">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faTag}
                            className="text-sm text-ink/50"
                        />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-ink">
                        {product.name}
                    </p>
                    {product.category?.name && (
                        <p className="truncate font-mono text-xs text-ink/50">
                            {product.category.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between sm:w-28 sm:flex-shrink-0 sm:justify-start">
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink/40 sm:hidden">
                    Price
                </span>
                <span className="font-mono text-sm font-semibold text-crate">
                    {formatPrice(product.price)}{" "}
                    <span className="text-[10px] font-normal uppercase tracking-wide text-ink/40">
                        /case
                    </span>
                </span>
            </div>

            {/* Stock status */}
            <div className="flex items-center justify-between sm:w-32 sm:flex-shrink-0">
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink/40 sm:hidden">
                    Stock
                </span>
                <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] text-kraft ${
                        outOfStock || limitReached ? "bg-route" : "bg-crate"
                    }`}
                >
                    {stockLabel}
                </span>
            </div>

            {/* Quantity + add to cart */}
            <div className="flex items-center gap-2 sm:ml-auto sm:w-64 sm:flex-shrink-0 sm:justify-end">
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
                            outOfStock || limitReached || quantity >= maxQty
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
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4 ${
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

            {!outOfStock && limitReached && (
                <p className="font-mono text-[10px] leading-tight text-route sm:hidden">
                    {`All ${stockValue} available already in your cart`}
                </p>
            )}
        </div>
    );
}
