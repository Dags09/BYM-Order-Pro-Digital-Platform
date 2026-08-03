import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faBoxOpen,
    faTag,
    faXmark,
    faFilter,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { SORT_OPTIONS } from "../../utils/constants";
import { ProductCard } from "../../components/customer/Shop/ProductCard";

import type { Category } from "../../types/category";
import type { Order } from "../../types/orders";
import type { Product } from "../../types/products";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("popular");
    const [activeCategory, setActiveCategory] = useState(
        searchParams.get("category") ?? "all",
    );

    useEffect(() => {
        const load = async () => {
            try {
                const [pRes, cRes, oRes] = await Promise.all([
                    api.get("/product/get-all-products"),
                    api.get("/category/get-all-categories"),
                    api.get("/order/my-orders"),
                ]);
                setProducts(pRes.data ?? []);
                setCategories(cRes.data ?? []);
                setOrders(oRes.data ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // sync category from URL param (e.g. coming from home page category button)
    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat) setActiveCategory(cat);
    }, [searchParams]);

    // ── popularity map from order history ─────────────────────────────────
    const popularityMap: Record<string, number> = {};
    orders.forEach((o: Order) => {
        if (o.status === "cancelled") return;
        (o.items ?? []).forEach((item) => {
            const pid =
                typeof item.product === "object"
                    ? item.product._id
                    : item.product;
            if (pid)
                popularityMap[pid] =
                    (popularityMap[pid] ?? 0) + (item.quantity ?? 1);
        });
    });

    // ── filter + sort products ─────────────────────────────────────────────
    const applySort = (list: Product[]): Product[] => {
        switch (sort) {
            case "price_asc":
                return [...list].sort((a, b) => a.price - b.price);
            case "price_desc":
                return [...list].sort((a, b) => b.price - a.price);
            case "name_asc":
                return [...list].sort((a, b) => a.name.localeCompare(b.name));
            case "name_desc":
                return [...list].sort((a, b) => b.name.localeCompare(a.name));
            case "popular":
            default:
                return [...list].sort(
                    (a, b) =>
                        (popularityMap[b._id] ?? 0) -
                        (popularityMap[a._id] ?? 0),
                );
        }
    };

    const filteredProducts = applySort(
        products.filter((p) => {
            const matchSearch =
                !search || p.name.toLowerCase().includes(search.toLowerCase());
            const matchCat =
                activeCategory === "all" || p.category?._id === activeCategory;
            return matchSearch && matchCat;
        }),
    );

    // ── group by category ──────────────────────────────────────────────────
    // if a specific category is selected or search is active, don't group — show flat grid
    const isGrouped = activeCategory === "all" && !search;

    const groupedByCategory = isGrouped
        ? categories
              .map((cat) => ({
                  category: cat,
                  products: applySort(
                      products.filter((p) => p.category?._id === cat._id),
                  ),
              }))
              .filter((g) => g.products.length > 0)
        : [];

    const handleCategoryClick = (id: string) => {
        setActiveCategory(id);
        setSearchParams(id !== "all" ? { category: id } : {});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading shop…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Shop</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                    Browse all available products.
                </p>
            </div>

            {/* Search + Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-10"
                    />
                    <input
                        type="text"
                        placeholder="Search products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                        icon={faFilter}
                        className="text-slate-400 text-sm flex-shrink-0"
                    />
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-300 cursor-pointer"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => handleCategoryClick("all")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition border
                        ${
                            activeCategory === "all"
                                ? "bg-green-700 text-white border-green-700"
                                : "bg-white text-slate-500 border-gray-200 hover:border-green-400 hover:text-green-700"
                        }`}
                >
                    All
                </button>
                {categories.map((c) => (
                    <button
                        key={c._id}
                        onClick={() => handleCategoryClick(c._id)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition border
                            ${
                                activeCategory === c._id
                                    ? "bg-green-700 text-white border-green-700"
                                    : "bg-white text-slate-500 border-gray-200 hover:border-green-400 hover:text-green-700"
                            }`}
                    >
                        <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                        {c.name}
                    </button>
                ))}
            </div>

            {/* ── Grouped by category (default view) ── */}
            {isGrouped ? (
                groupedByCategory.length === 0 ? (
                    <div className="text-center py-20">
                        <FontAwesomeIcon
                            icon={faBoxOpen}
                            className="text-5xl text-gray-200 mb-3"
                        />
                        <p className="text-slate-400 text-sm">
                            No products available
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {groupedByCategory.map(
                            ({ category, products: catProducts }) => (
                                <div key={category._id}>
                                    {/* Category header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                                <FontAwesomeIcon
                                                    icon={faTag}
                                                    className="text-green-600 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {category.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {catProducts.length} product
                                                    {catProducts.length !== 1
                                                        ? "s"
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleCategoryClick(
                                                    category._id,
                                                )
                                            }
                                            className="text-xs text-green-700 font-medium hover:underline"
                                        >
                                            View all →
                                        </button>
                                    </div>

                                    {/* Horizontal scroll row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {catProducts.slice(0, 5).map((p) => (
                                            <ProductCard
                                                key={p._id}
                                                product={p}
                                            />
                                        ))}
                                    </div>

                                    {catProducts.length > 5 && (
                                        <button
                                            onClick={() =>
                                                handleCategoryClick(
                                                    category._id,
                                                )
                                            }
                                            className="mt-3 text-xs text-green-700 font-medium hover:underline"
                                        >
                                            + {catProducts.length - 5} more in{" "}
                                            {category.name}
                                        </button>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                )
            ) : (
                /* ── Filtered flat grid (search or category selected) ── */
                <div>
                    <p className="text-xs text-slate-400 mb-4">
                        {filteredProducts.length} product
                        {filteredProducts.length !== 1 ? "s" : ""} found
                        {activeCategory !== "all" &&
                            ` in ${categories.find((c) => c._id === activeCategory)?.name ?? ""}`}
                        {search && ` for "${search}"`}
                    </p>
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <FontAwesomeIcon
                                icon={faBoxOpen}
                                className="text-5xl text-gray-200 mb-3"
                            />
                            <p className="text-slate-400 text-sm">
                                No products found
                            </p>
                            <button
                                onClick={() => {
                                    setSearch("");
                                    handleCategoryClick("all");
                                }}
                                className="mt-3 text-xs text-green-700 font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProducts.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
