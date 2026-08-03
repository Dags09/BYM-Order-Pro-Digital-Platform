import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../../layout/CustomerSideNavBar";
import { peso } from "../../../utils/formatters";
import type { Product } from "../../../types/products";

type ProductCardProps = {
    product: Product & { qty?: number };
};

function ProductCard({ product }: ProductCardProps) {
    const { add, update, remove, items } = useCart();
    const inCart = items.find((i) => i._id === product._id);
    const [inputQty, setInputQty] = useState<number | "">(1);

    useEffect(() => {
        if (inCart) {
            setInputQty(inCart.qty);
        }
    }, [inCart]);

    const handleQtyChange = (val: string) => {
        const n = parseInt(val);
        if (isNaN(n) || n < 1) {
            setInputQty("");
            return;
        }
        const capped = Math.min(n, product.stock);
        setInputQty(capped);
        if (inCart) update(product._id, capped);
    };

    const handleAdd = () => {
        const qty = Number(inputQty) || 1;
        const capped = Math.min(qty, product.stock);
        if (inCart) {
            update(product._id, capped);
        } else {
            add({ ...product, qty: capped });
            if (capped > 1) update(product._id, capped);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
            <div className="relative h-36 bg-gray-50 overflow-hidden">
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
                            className="text-4xl text-gray-200"
                        />
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                            Out of stock
                        </span>
                    </div>
                )}
                {product.stock > 0 && product.stock <= 10 && (
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
                    {product.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {product.description}
                        </p>
                    )}
                    <p className="text-sm font-bold text-green-700 mt-1">
                        {peso(product.price)}
                    </p>
                </div>

                {product.stock > 0 &&
                    (inCart ? (
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
                                onChange={(e) =>
                                    handleQtyChange(e.target.value)
                                }
                                onBlur={() => {
                                    if (!inputQty || inputQty < 1) {
                                        setInputQty(1);
                                        update(product._id, 1);
                                    }
                                }}
                                className="flex-1 w-0 text-center text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
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
                                onChange={(e) =>
                                    handleQtyChange(e.target.value)
                                }
                                onBlur={() => {
                                    if (!inputQty || inputQty < 1)
                                        setInputQty(1);
                                }}
                                className="flex-1 w-0 text-center text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
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
                    ))}

                {inCart && (
                    <p className="text-xs text-green-700 font-medium text-center">
                        ✓ In cart
                    </p>
                )}
            </div>
        </div>
    );
}

export { ProductCard };
