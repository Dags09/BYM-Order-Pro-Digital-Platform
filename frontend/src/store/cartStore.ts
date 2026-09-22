import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types/product";
import type { CartItem } from "../types/carts";

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) =>
                set((state) => {
                    const existing = state.items.find(
                        (item) => item.productId === product._id,
                    );

                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.productId === product._id
                                    ? {
                                          ...item,
                                          quantity: item.quantity + quantity,
                                      }
                                    : item,
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product._id,
                                name: product.name,
                                price: product.price,
                                imageUrl: product.imageUrl,
                                quantity,
                            },
                        ],
                    };
                }),

            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter(
                        (item) => item.productId !== productId,
                    ),
                })),

            updateQuantity: (productId, quantity) =>
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter(
                                  (item) => item.productId !== productId,
                              )
                            : state.items.map((item) =>
                                  item.productId === productId
                                      ? { ...item, quantity }
                                      : item,
                              ),
                })),

            clearCart: () => set({ items: [] }),

            totalItems: () =>
                get().items.reduce((sum, item) => sum + item.quantity, 0),

            totalPrice: () =>
                get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0,
                ),
        }),
        { name: "bym-cart" },
    ),
);

export default useCartStore;
