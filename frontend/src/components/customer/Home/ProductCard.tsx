import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../../layout/CustomerSideNavBar";
import { useState, useEffect, useRef } from "react";
import { peso } from "../../../utils/formatters";

function ProductCard({ product }: { product: any }) {
    const { add, update, remove, items } = useCart();
    const inCart = items.find((i: { _id: string }) => i._id === product._id);
    const [inputQty, setInputQty] = useState<number | "">(inCart?.qty ?? 1);
    const isFocused = useRef(false);

    // sync from cart only when NOT focused
    useEffect(() => {
        if (!isFocused.current && inCart) {
            setInputQty(inCart.qty);
        }
    }, [inCart?.qty]);

    // reset to 1 when removed from cart
    useEffect(() => {
        if (!inCart) setInputQty(1);
    }, [inCart]);

    const handleQtyChange = (val: string) => {
        const n = parseInt(val);
        if (isNaN(n) || n < 1) {
            setInputQty("");
            return;
        }
        setInputQty(Math.min(n, product.stock));
    };

    const commitQty = () => {
        const qty =
            typeof inputQty === "number"
                ? inputQty
                : parseInt(String(inputQty), 10);
        const safeQty = Number.isNaN(qty) || qty < 1 ? 1 : qty;
        const capped = Math.min(safeQty, product.stock);
        setInputQty(capped);
        if (inCart) update(product._id, capped);
    };

    const handleAdd = () => {
        const qty =
            typeof inputQty === "number"
                ? inputQty
                : parseInt(String(inputQty), 10);
        const safeQty = Number.isNaN(qty) || qty < 1 ? 1 : qty;
        const capped = Math.min(safeQty, product.stock);
        if (inCart) {
            update(product._id, capped);
        } else {
            add(product);
            if (capped > 1) update(product._id, capped);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group flex-shrink-0 w-44">
            <div className="relative h-32 bg-gray-50 overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faBoxOpen}
                            className="text-3xl text-gray-200"
                        />
                    </div>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
                        {product.stock} left
                    </span>
                )}
            </div>
            <div className="p-3 space-y-2">
                <div>
                    <p className="text-sm font-semibold text-slate-700 truncate">
                        {product.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                        {product.category?.name ?? ""}
                    </p>
                    <p className="text-sm font-bold text-green-700 mt-1">
                        {peso(product.price)}
                    </p>
                </div>

                {inCart ? (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                if (inCart.qty <= 1) remove(product._id);
                                else update(product._id, inCart.qty - 1);
                            }}
                            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition flex-shrink-0"
                        >
                            <FontAwesomeIcon
                                icon={faMinus}
                                className="text-xs"
                            />
                        </button>
                        <input
                            type="number"
                            min={1}
                            max={product.stock}
                            value={inputQty}
                            onChange={(e) => handleQtyChange(e.target.value)}
                            onFocus={() => {
                                isFocused.current = true;
                            }}
                            onBlur={() => {
                                isFocused.current = false;
                                commitQty();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    commitQty();
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            className="flex-1 w-0 text-center text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                        <button
                            onClick={() =>
                                update(
                                    product._id,
                                    Math.min(inCart.qty + 1, product.stock),
                                )
                            }
                            className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center text-white hover:bg-green-800 transition flex-shrink-0"
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="text-xs"
                            />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            min={1}
                            max={product.stock}
                            value={inputQty}
                            onChange={(e) => handleQtyChange(e.target.value)}
                            onFocus={() => {
                                isFocused.current = true;
                            }}
                            onBlur={() => {
                                isFocused.current = false;
                                if (!inputQty || inputQty < 1) setInputQty(1);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAdd();
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            className="flex-1 w-0 text-center text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                        <button
                            onClick={handleAdd}
                            className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center text-white hover:bg-green-800 transition flex-shrink-0"
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="text-xs"
                            />
                        </button>
                    </div>
                )}

                {inCart && (
                    <p className="text-xs text-green-700 font-medium text-center">
                        ✓ In cart
                    </p>
                )}
            </div>
        </div>
    );
}
export default ProductCard;
