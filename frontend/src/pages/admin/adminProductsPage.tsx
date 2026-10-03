import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Search,
    Package,
    AlertTriangle,
    SlidersHorizontal,
} from "lucide-react";
import api from "../../lib/axios";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import { formatPrice, formatShortDate } from "../../utils/formatters";
import ManagerProductFilterModal, {
    type StockFilter,
} from "../../components/pageComponents/manager/managerProductFilterModal";
import { AdminProductsSkeleton } from "../../components/pageComponents/admin/adminPageSkeletons";

const LOW_STOCK_THRESHOLD = 10;

export default function AdminProductsPage() {
    const [searchParams] = useSearchParams();
    const initialStockFilter = searchParams.get("stock");
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string[]>(["all"]);
    const [stockFilter, setStockFilter] = useState<StockFilter>(() =>
        initialStockFilter === "low-stock" ||
        initialStockFilter === "out-of-stock" ||
        initialStockFilter === "in-stock"
            ? initialStockFilter
            : "all",
    );
    const [showFilterModal, setShowFilterModal] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get("/product/get-all-products"),
            api.get("/category/get-all-categories"),
        ])
            .then(([productsRes, categoriesRes]) => {
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            })
            .catch(() => setError("Couldn't load products."))
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter((p) => {
        const matchesSearch = search.trim()
            ? p.name.toLowerCase().includes(search.trim().toLowerCase())
            : true;
        const productCategoryId =
            typeof p.category === "object" ? p.category?._id : p.category;
        const matchesCategory =
            categoryFilter.includes("all") ||
            categoryFilter.length === 0 ||
            (productCategoryId !== undefined &&
                categoryFilter.includes(productCategoryId));
        const matchesStock =
            stockFilter === "all" ||
            (stockFilter === "out-of-stock" && p.stock === 0) ||
            (stockFilter === "low-stock" &&
                p.stock > 0 &&
                p.stock < LOW_STOCK_THRESHOLD) ||
            (stockFilter === "in-stock" && p.stock > 0);
        return matchesSearch && matchesCategory && matchesStock;
    });

    if (loading) {
        return <AdminProductsSkeleton />;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Products
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Catalog oversight. Adding, editing, and restocking are
                    handled by managers.
                </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
                        strokeWidth={1.75}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products"
                        className="w-full rounded-md border-2 border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate sm:w-64"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowFilterModal(true)}
                    aria-haspopup="dialog"
                    aria-expanded={showFilterModal}
                    className={`relative flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        showFilterModal
                            ? "border-crate bg-crate text-white"
                            : "border-ink/20 bg-white text-ink/70 hover:text-ink"
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                    Filter
                    {((!categoryFilter.includes("all") &&
                        categoryFilter.length > 0) ||
                        stockFilter !== "all") &&
                        !showFilterModal && (
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-signal" />
                        )}
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-ink/10 bg-white p-10 text-center shadow-sm">
                    <Package
                        className="mx-auto h-8 w-8 text-ink/20"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/50">
                        No products match this filter.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/40">
                                    <th className="px-5 py-3 font-medium">
                                        Product
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Category
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Price
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Stock
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Added
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => {
                                    const lowStock =
                                        p.stock < LOW_STOCK_THRESHOLD;
                                    return (
                                        <tr
                                            key={p._id}
                                            className="border-b border-ink/5 last:border-0"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.imageUrl ? (
                                                        <img
                                                            src={p.imageUrl}
                                                            alt=""
                                                            className="h-9 w-9 shrink-0 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-kraft">
                                                            <Package className="h-4 w-4 text-ink/30" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-ink">
                                                        {p.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-ink/60">
                                                {p.category?.name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3 font-mono text-ink/80">
                                                {formatPrice(p.price)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        lowStock
                                                            ? "bg-route/10 text-route"
                                                            : "text-ink/70"
                                                    }`}
                                                >
                                                    {lowStock && (
                                                        <AlertTriangle className="h-3 w-3" />
                                                    )}
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-ink/50">
                                                {p.createdAt
                                                    ? formatShortDate(
                                                          p.createdAt,
                                                      )
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showFilterModal && (
                <ManagerProductFilterModal
                    categories={categories}
                    categoryFilter={categoryFilter}
                    stockFilter={stockFilter}
                    onApply={(categories, stock) => {
                        setCategoryFilter(categories);
                        setStockFilter(stock);
                        setShowFilterModal(false);
                    }}
                    onClose={() => setShowFilterModal(false)}
                />
            )}
        </div>
    );
}
