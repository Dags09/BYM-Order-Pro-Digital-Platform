import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Search, LayoutGrid, List as ListIcon } from "lucide-react";
import api from "../../lib/axios";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import useAuthStore from "../../store/authStore";
import NavBar from "../../components/pageComponents/customer/homePage/navBar";
import Footer from "../../components/pageComponents/customer/homePage/footer";
import ProductCard from "../../components/pageComponents/customer/shopPage/productCard";
import ProductListItem from "../../components/pageComponents/customer/shopPage/productListItem";
import CategoryFilter from "../../components/pageComponents/customer/shopPage/categoryFilter";

type ViewMode = "grid" | "list";
const VIEW_MODE_STORAGE_KEY = "bym-shop-view";

export default function ShopPage() {
    const { isAuthenticated } = useAuthStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        return stored === "list" ? "list" : "grid";
    });

    useEffect(() => {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }, [viewMode]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get("/product/get-all-products"),
                    api.get("/category/get-all-categories"),
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error("Failed to fetch shop data:", err);
                setError("Couldn't load the catalog. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh products every 1 second to immediately update stock levels
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === "all" ||
                product.category?._id === selectedCategory;
            const matchesSearch = product.name
                .toLowerCase()
                .includes(search.trim().toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, search]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div>
            <NavBar />

            <main className="bg-kraft px-4 py-10 md:px-8 lg:px-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-crate">
                                Full catalog
                            </p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                                Shop
                            </h1>
                        </div>

                        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                            <div className="relative w-full max-w-xs flex-1 sm:flex-none">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full rounded-md border-2 border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate"
                                />
                            </div>

                            <div
                                role="group"
                                aria-label="Switch product view"
                                className="flex flex-shrink-0 rounded-md border-2 border-ink/20 bg-white p-0.5"
                            >
                                <button
                                    type="button"
                                    onClick={() => setViewMode("grid")}
                                    aria-pressed={viewMode === "grid"}
                                    aria-label="Tile view"
                                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition ${
                                        viewMode === "grid"
                                            ? "bg-crate text-kraft"
                                            : "text-ink/50 hover:text-ink"
                                    }`}
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Tiles
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    aria-pressed={viewMode === "list"}
                                    aria-label="Table view"
                                    className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition ${
                                        viewMode === "list"
                                            ? "bg-crate text-kraft"
                                            : "text-ink/50 hover:text-ink"
                                    }`}
                                >
                                    <ListIcon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Table
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {!loading && !error && categories.length > 0 && (
                        <div className="mb-6">
                            <CategoryFilter
                                categories={categories}
                                selected={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                        </div>
                    )}

                    {loading ? (
                        <p className="font-mono text-sm text-ink/50">
                            Loading catalog...
                        </p>
                    ) : error ? (
                        <p className="font-mono text-sm text-route">{error}</p>
                    ) : filteredProducts.length === 0 ? (
                        <p className="font-mono text-sm text-ink/50">
                            No products match your search.
                        </p>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border-2 border-ink bg-white shadow-[4px_4px_0_0_theme(colors.ink)]">
                            <div className="hidden border-b-2 border-ink bg-kraft-dark/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wide text-ink/50 sm:flex sm:items-center sm:gap-4">
                                <span className="w-64 flex-shrink-0">
                                    Product
                                </span>
                                <span className="w-28 flex-shrink-0">
                                    Price
                                </span>
                                <span className="w-32 flex-shrink-0">
                                    Stock
                                </span>
                                <span className="ml-auto w-64 flex-shrink-0 text-right">
                                    Quantity
                                </span>
                            </div>
                            {filteredProducts.map((product) => (
                                <ProductListItem
                                    key={product._id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
