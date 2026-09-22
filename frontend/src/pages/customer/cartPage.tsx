import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../utils/formatters";
import NavBar from "../../components/pageComponents/customer/homePage/navBar";
import Footer from "../../components/pageComponents/customer/homePage/footer";
import CartItemRow from "../../components/pageComponents/customer/cartPage/cartItemRow";

export default function CartPage() {
    const { items, totalItems, totalPrice, clearCart } = useCartStore();

    return (
        <div>
            <NavBar />

            <main className="min-h-[60vh] bg-kraft px-4 py-10 md:px-8 lg:px-12">
                <div className="container mx-auto max-w-5xl">
                    <div className="mb-8 flex items-center justify-between border-b-2 border-ink pb-4">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-crate">
                                Order manifest
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                                Your cart
                            </h1>
                        </div>
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="font-mono text-xs text-route underline-offset-2 hover:underline"
                            >
                                Clear cart
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-ink/20 py-20 text-center">
                            <ShoppingBag className="h-10 w-10 text-ink/30" />
                            <p className="mt-4 font-display text-lg font-semibold text-ink">
                                Your cart is empty
                            </p>
                            <p className="mt-1 text-sm text-ink/60">
                                Browse the catalog to start restocking.
                            </p>
                            <Link
                                to="/shop"
                                className="mt-6 rounded-md bg-crate px-6 py-2.5 text-sm font-semibold text-kraft transition hover:bg-crate-dark"
                            >
                                Go to shop
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                            <div className="rounded-lg border-2 border-ink bg-white px-5">
                                <ul>
                                    {items.map((item) => (
                                        <CartItemRow
                                            key={item.productId}
                                            item={item}
                                        />
                                    ))}
                                </ul>
                            </div>

                            <div className="h-fit rounded-lg border-2 border-ink bg-white p-5 shadow-[4px_4px_0_0_theme(colors.crate)]">
                                <p className="font-display text-base font-semibold text-ink">
                                    Order summary
                                </p>

                                <div className="mt-4 space-y-2 border-t border-dashed border-ink/20 pt-4 font-mono text-sm">
                                    <div className="flex justify-between text-ink/70">
                                        <span>Items ({totalItems()})</span>
                                        <span>{formatPrice(totalPrice())}</span>
                                    </div>
                                    <div className="flex justify-between text-ink/70">
                                        <span>Delivery</span>
                                        <span>Calculated at checkout</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t-2 border-ink pt-4">
                                    <span className="font-display text-sm font-semibold text-ink">
                                        Total
                                    </span>
                                    <span className="font-mono text-lg font-semibold text-crate">
                                        {formatPrice(totalPrice())}
                                    </span>
                                </div>

                                <Link
                                    to="/checkout"
                                    className="mt-5 block w-full rounded-md bg-signal py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-signal-dark"
                                >
                                    Proceed to checkout
                                </Link>

                                <Link
                                    to="/shop"
                                    className="mt-3 block text-center font-mono text-xs text-ink/50 hover:text-ink"
                                >
                                    ← Continue shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
