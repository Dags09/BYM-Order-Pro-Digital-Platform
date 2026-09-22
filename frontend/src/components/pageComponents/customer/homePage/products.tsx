import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import api from "../../../../lib/axios";
import useAuthStore from "../../../../store/authStore";
import type { Product } from "../../../../types/product";
import { formatPrice } from "../../../../utils/formatters";

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get("/product/get-all-products");
                setProducts(data.slice(0, 6));
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const goToShop = () => {
        navigate(isAuthenticated ? "/shop" : "/Login");
    };

    return (
        <section id="products" className="bg-kraft px-4 py-16 md:px-8 lg:px-12">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.25em] text-crate">
                            Catalog
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
                            Restock essentials
                        </h2>
                    </div>
                    <p className="max-w-xs text-sm text-ink/60">
                        Wholesale prices per case, updated daily. Order today,
                        delivered by tomorrow.
                    </p>
                </div>

                {loading ? (
                    <p className="font-mono text-sm text-ink/50">
                        Loading catalog...
                    </p>
                ) : products.length === 0 ? (
                    <p className="font-mono text-sm text-ink/50">
                        No products available right now.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <button
                                key={product._id}
                                type="button"
                                onClick={goToShop}
                                className="group cursor-pointer rounded-lg border-2 border-ink bg-white text-left shadow-[3px_3px_0_0_theme(colors.ink)] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(colors.crate)]"
                            >
                                <div className="relative flex h-44 items-center justify-center overflow-hidden border-b-2 border-ink bg-kraft-dark/60">
                                    {product.stock > 0 ? (
                                        <span className="absolute right-2 top-2 rounded bg-crate px-2 py-0.5 font-mono text-[10px] text-kraft">
                                            In stock
                                        </span>
                                    ) : (
                                        <span className="absolute right-2 top-2 rounded bg-route px-2 py-0.5 font-mono text-[10px] text-kraft">
                                            Out of stock
                                        </span>
                                    )}

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

                                <div className="p-4">
                                    <p className="font-display text-base font-semibold text-ink">
                                        {product.name}
                                    </p>
                                    {product.category?.name && (
                                        <p className="mt-0.5 font-mono text-xs text-ink/50">
                                            {product.category.name}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-baseline justify-between border-t border-dashed border-ink/20 pt-3">
                                        <span className="font-mono text-lg font-semibold text-crate">
                                            {formatPrice(product.price)}
                                        </span>
                                        <span className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
                                            per case
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-10 flex justify-center">
                    <button
                        type="button"
                        onClick={goToShop}
                        className="rounded-md border-2 border-ink px-6 py-2.5 font-medium text-ink transition hover:bg-ink hover:text-kraft"
                    >
                        View full catalog →
                    </button>
                </div>
            </div>
        </section>
    );
}
