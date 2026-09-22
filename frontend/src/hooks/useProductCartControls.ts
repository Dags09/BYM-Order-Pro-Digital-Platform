import { useState } from "react";
import type { Product } from "../types/product";
import useCartStore from "../store/cartStore";

export function useProductCartControls(product: Product) {
    const addItem = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);

    const stockValue = Number.isFinite(Number(product.stock))
        ? Number(product.stock)
        : 0;

    const outOfStock = stockValue <= 0;

    const alreadyInCart =
        cartItems.find((item) => item.productId === product._id)?.quantity ?? 0;
    const remainingStock = Math.max(0, stockValue - alreadyInCart);

    const limitReached = !outOfStock && remainingStock <= 0;
    const maxQty = outOfStock || limitReached ? 1 : remainingStock;

    const [quantity, setQuantity] = useState(1);
    const [quantityInput, setQuantityInput] = useState("1");
    const [added, setAdded] = useState(false);

    const commitQuantity = (value: number) => {
        const clamped = Math.min(Math.max(1, value), maxQty);
        setQuantity(clamped);
        setQuantityInput(String(clamped));
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        if (raw !== "" && !/^\d+$/.test(raw)) return;

        const parsed = parseInt(raw, 10);

        if (raw !== "" && !isNaN(parsed) && parsed > maxQty) {
            setQuantityInput(String(maxQty));
            setQuantity(maxQty);
            return;
        }

        setQuantityInput(raw);
        if (!isNaN(parsed) && parsed >= 1) {
            setQuantity(parsed);
        }
    };

    const handleQuantityBlur = () => {
        const parsed = parseInt(quantityInput, 10);
        commitQuantity(isNaN(parsed) ? 1 : parsed);
    };

    const handleAdd = () => {
        if (outOfStock || limitReached) return;
        addItem(product, quantity);
        setAdded(true);
        commitQuantity(1);
        setTimeout(() => setAdded(false), 1500);
    };

    return {
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
    };
}
