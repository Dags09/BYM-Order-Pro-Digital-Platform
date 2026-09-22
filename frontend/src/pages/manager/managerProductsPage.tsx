import {
    useEffect,
    useState,
    useCallback,
    useRef,
    type FormEvent,
} from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    PackagePlus,
    X,
    ImageOff,
    Loader2,
    List,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import api from "../../lib/axios";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import { formatPrice } from "../../utils/formatters";

const LOW_STOCK_THRESHOLD = 5;

type ViewMode = "list" | "card";

const CARD_GRID_CLASS =
    "grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const LIST_PAGE_SIZE = 6;
const CARD_PAGE_SIZE = 9;

const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
};

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

// A scrollable dropdown for category selection — caps its open list at a
// fixed height so a long category list doesn't grow the page endlessly.
function CategoryDropdown({
    categories,
    value,
    onChange,
    placeholder,
    includeAllOption,
}: {
    categories: Category[];
    value: string;
    onChange: (id: string) => void;
    placeholder: string;
    includeAllOption?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
        value === "all"
            ? "All categories"
            : (categories.find((c) => c._id === value)?.name ?? placeholder);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-2 rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
            >
                <span className={value ? "" : "text-ink/40"}>
                    {selectedLabel}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
                    strokeWidth={1.75}
                />
            </button>
            {open && (
                <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-ink/10 bg-white py-1 shadow-lg">
                    {includeAllOption && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange("all");
                                setOpen(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-kraft/50 ${
                                value === "all"
                                    ? "bg-crate/10 font-medium text-crate"
                                    : "text-ink"
                            }`}
                        >
                            All categories
                        </button>
                    )}
                    {categories.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-ink/40">
                            No categories yet.
                        </p>
                    ) : (
                        categories.map((c) => (
                            <button
                                key={c._id}
                                type="button"
                                onClick={() => {
                                    onChange(c._id);
                                    setOpen(false);
                                }}
                                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-kraft/50 ${
                                    value === c._id
                                        ? "bg-crate/10 font-medium text-crate"
                                        : "text-ink"
                                }`}
                            >
                                {c.name}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default function ManagerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [viewMode, setViewMode] = useState<ViewMode>("card");
    const [currentPage, setCurrentPage] = useState(1);

    // Create / edit modal
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Add stock modal
    const [stockTarget, setStockTarget] = useState<Product | null>(null);
    const [stockQty, setStockQty] = useState("");
    const [addingStock, setAddingStock] = useState(false);
    const [stockError, setStockError] = useState<string | null>(null);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadAll = useCallback(() => {
        setLoading(true);
        setError(null);
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

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const filtered = products.filter((p) => {
        const matchesSearch = search.trim()
            ? p.name.toLowerCase().includes(search.trim().toLowerCase())
            : true;
        const matchesCategory =
            categoryFilter === "all" ||
            (typeof p.category === "object"
                ? p.category?._id === categoryFilter
                : p.category === categoryFilter);
        return matchesSearch && matchesCategory;
    });

    const pageSize = viewMode === "list" ? LIST_PAGE_SIZE : CARD_PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );
    const rangeStart =
        filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const rangeEnd = Math.min(safePage * pageSize, filtered.length);

    // Reset to page 1 whenever the result set or the page size changes.
    useEffect(() => {
        setCurrentPage(1);
    }, [search, categoryFilter, viewMode]);

    // ---- Create / edit form ----

    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview(null);
        setFormError(null);
        setShowForm(true);
    };

    const openEditForm = (product: Product) => {
        setEditingId(product._id);
        setForm({
            name: product.name,
            description: product.description ?? "",
            price: String(product.price),
            stock: String(product.stock),
            category:
                (typeof product.category === "object"
                    ? product.category?._id
                    : product.category) ?? "",
        });
        setImageFile(null);
        setImagePreview(product.imageUrl ?? null);
        setFormError(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const handleImageChange = (file: File | null) => {
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!form.category) {
            setFormError("Please select a category.");
            return;
        }

        setSaving(true);

        const payload = new FormData();
        payload.append("name", form.name);
        payload.append("description", form.description);
        payload.append("price", form.price);
        payload.append("category", form.category);
        // Stock is only set on create; edits go through the dedicated
        // "Add stock" action so this form can't silently overwrite it.
        if (!editingId) payload.append("stock", form.stock);
        if (imageFile) payload.append("image", imageFile);

        try {
            if (editingId) {
                await api.put(`/product/update-product/${editingId}`, payload);
            } else {
                await api.post("/product/create-product", payload);
            }
            closeForm();
            loadAll();
        } catch (err) {
            setFormError(getErrorMessage(err, "Couldn't save this product."));
        } finally {
            setSaving(false);
        }
    };

    // ---- Add stock ----

    const handleAddStock = async (e: FormEvent) => {
        e.preventDefault();
        if (!stockTarget) return;
        setStockError(null);
        const quantity = Number(stockQty);
        if (!quantity || quantity <= 0) {
            setStockError("Enter a quantity greater than 0.");
            return;
        }
        setAddingStock(true);
        try {
            await api.post(`/product/add-stock/${stockTarget._id}`, {
                quantity,
            });
            setStockTarget(null);
            setStockQty("");
            loadAll();
        } catch (err) {
            setStockError(getErrorMessage(err, "Couldn't add stock."));
        } finally {
            setAddingStock(false);
        }
    };

    // ---- Delete ----

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/product/delete-product/${deleteTarget._id}`);
            setDeleteTarget(null);
            loadAll();
        } catch (err) {
            setError(getErrorMessage(err, "Couldn't delete this product."));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const inputClass =
        "w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate";
    const labelClass = "mb-1.5 block text-sm font-medium text-ink";

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                        Products
                    </h1>
                    <p className="mt-1 text-sm text-ink/60">
                        Create, edit, and restock products.
                    </p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center justify-center gap-1.5 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                    Add product
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                            className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate sm:w-64"
                        />
                    </div>
                    <div className="sm:w-56">
                        <CategoryDropdown
                            categories={categories}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            placeholder="All categories"
                            includeAllOption
                        />
                    </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 rounded-md border border-ink/10 bg-white p-1">
                        <button
                            onClick={() => setViewMode("list")}
                            title="List view"
                            className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-sm font-medium transition-colors ${
                                viewMode === "list"
                                    ? "bg-crate text-white"
                                    : "text-ink/60 hover:text-ink"
                            }`}
                        >
                            <List className="h-4 w-4" strokeWidth={1.75} />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            title="Card view"
                            className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-sm font-medium transition-colors ${
                                viewMode === "card"
                                    ? "bg-crate text-white"
                                    : "text-ink/60 hover:text-ink"
                            }`}
                        >
                            <LayoutGrid
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                            Card
                        </button>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/50 p-10 text-center">
                    <p className="text-sm text-ink/60">
                        No products match this view.
                    </p>
                </div>
            ) : viewMode === "list" ? (
                <div className="space-y-3">
                    {paginated.map((product) => {
                        const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
                        const categoryName =
                            typeof product.category === "object"
                                ? product.category?.name
                                : undefined;
                        return (
                            <div
                                key={product._id}
                                className="flex items-center gap-4 rounded-lg border border-ink/10 bg-white p-3 shadow-sm"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-kraft/40">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ImageOff
                                            className="h-5 w-5 text-ink/20"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    {categoryName && (
                                        <span className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
                                            {categoryName}
                                        </span>
                                    )}
                                    <p className="truncate font-medium text-ink">
                                        {product.name}
                                    </p>
                                </div>

                                <span className="shrink-0 font-display text-sm font-semibold text-ink">
                                    {formatPrice(product.price)}
                                </span>

                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                        lowStock
                                            ? "bg-route/10 text-route"
                                            : "bg-crate/10 text-crate"
                                    }`}
                                >
                                    {product.stock} in stock
                                </span>

                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        onClick={() => openEditForm(product)}
                                        className="flex items-center justify-center gap-1 rounded-md border border-ink/15 px-2 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5"
                                    >
                                        <Pencil
                                            className="h-3.5 w-3.5"
                                            strokeWidth={1.75}
                                        />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStockTarget(product);
                                            setStockQty("");
                                            setStockError(null);
                                        }}
                                        className="flex items-center justify-center gap-1 rounded-md border border-ink/15 px-2 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5"
                                    >
                                        <PackagePlus
                                            className="h-3.5 w-3.5"
                                            strokeWidth={1.75}
                                        />
                                        Stock
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(product)}
                                        className="flex items-center justify-center rounded-md border border-route/20 p-1.5 text-route transition-colors hover:bg-route/5"
                                        title="Delete product"
                                    >
                                        <Trash2
                                            className="h-3.5 w-3.5"
                                            strokeWidth={1.75}
                                        />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`grid ${CARD_GRID_CLASS}`}>
                    {paginated.map((product) => {
                        const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
                        const categoryName =
                            typeof product.category === "object"
                                ? product.category?.name
                                : undefined;
                        return (
                            <div
                                key={product._id}
                                className="flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm"
                            >
                                <div className="flex h-36 items-center justify-center bg-kraft/40">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <ImageOff
                                            className="h-8 w-8 text-ink/20"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    {categoryName && (
                                        <span className="text-[11px] font-medium uppercase tracking-wide text-ink/40">
                                            {categoryName}
                                        </span>
                                    )}
                                    <p className="mt-0.5 truncate font-medium text-ink">
                                        {product.name}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="font-display text-lg font-semibold text-ink">
                                            {formatPrice(product.price)}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                lowStock
                                                    ? "bg-route/10 text-route"
                                                    : "bg-crate/10 text-crate"
                                            }`}
                                        >
                                            {product.stock} in stock
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2 border-t border-ink/10 pt-3">
                                        <button
                                            onClick={() =>
                                                openEditForm(product)
                                            }
                                            className="flex flex-1 items-center justify-center gap-1 rounded-md border border-ink/15 px-2 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5"
                                        >
                                            <Pencil
                                                className="h-3.5 w-3.5"
                                                strokeWidth={1.75}
                                            />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setStockTarget(product);
                                                setStockQty("");
                                                setStockError(null);
                                            }}
                                            className="flex flex-1 items-center justify-center gap-1 rounded-md border border-ink/15 px-2 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5"
                                        >
                                            <PackagePlus
                                                className="h-3.5 w-3.5"
                                                strokeWidth={1.75}
                                            />
                                            Stock
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeleteTarget(product)
                                            }
                                            className="flex items-center justify-center rounded-md border border-route/20 p-1.5 text-route transition-colors hover:bg-route/5"
                                            title="Delete product"
                                        >
                                            <Trash2
                                                className="h-3.5 w-3.5"
                                                strokeWidth={1.75}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filtered.length > 0 && totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-4 sm:flex-row">
                    <p className="text-xs text-ink/50">
                        Showing {rangeStart}–{rangeEnd} of {filtered.length}{" "}
                        product{filtered.length === 1 ? "" : "s"}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={safePage === 1}
                            className="flex items-center gap-1 rounded-md border border-ink/15 px-2.5 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                            Prev
                        </button>
                        <span className="px-2 text-sm text-ink/60">
                            Page {safePage} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1),
                                )
                            }
                            disabled={safePage === totalPages}
                            className="flex items-center gap-1 rounded-md border border-ink/15 px-2.5 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight
                                className="h-4 w-4"
                                strokeWidth={1.75}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* Create / edit modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold text-ink">
                                {editingId ? "Edit product" : "Add product"}
                            </h2>
                            <button
                                onClick={closeForm}
                                className="text-ink/40 hover:text-ink"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={labelClass}>Name</label>
                                <input
                                    required
                                    maxLength={100}
                                    className={inputClass}
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Description
                                </label>
                                <textarea
                                    required
                                    maxLength={200}
                                    rows={3}
                                    className={inputClass}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div
                                className={
                                    editingId
                                        ? undefined
                                        : "grid grid-cols-2 gap-4"
                                }
                            >
                                <div>
                                    <label className={labelClass}>Price</label>
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        step="0.01"
                                        className={inputClass}
                                        value={form.price}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                price: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                {editingId ? (
                                    <p className="mt-2 text-xs text-ink/40">
                                        Current stock: {form.stock}. Use the
                                        Stock action on the product card to add
                                        more.
                                    </p>
                                ) : (
                                    <div>
                                        <label className={labelClass}>
                                            Stock
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min={0}
                                            className={inputClass}
                                            value={form.stock}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    stock: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Category</label>
                                <CategoryDropdown
                                    categories={categories}
                                    value={form.category}
                                    onChange={(id) =>
                                        setForm({ ...form, category: id })
                                    }
                                    placeholder="Select a category"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Image</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink/10 bg-kraft/40">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImageOff
                                                className="h-5 w-5 text-ink/20"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleImageChange(
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                        className="text-sm text-ink/70"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-ink/40">
                                    {editingId
                                        ? "Leave empty to keep the current image."
                                        : "Optional."}
                                </p>
                            </div>

                            {formError && (
                                <p className="rounded-md border border-route/20 bg-route/5 px-3 py-2 text-sm text-route">
                                    {formError}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-60"
                                >
                                    {saving && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {editingId
                                        ? "Save changes"
                                        : "Create product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add stock modal */}
            {stockTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold text-ink">
                                Add stock
                            </h2>
                            <button
                                onClick={() => setStockTarget(null)}
                                className="text-ink/40 hover:text-ink"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mb-3 text-sm text-ink/60">
                            {stockTarget.name} — currently {stockTarget.stock}{" "}
                            in stock.
                        </p>
                        <form onSubmit={handleAddStock} className="space-y-3">
                            <input
                                autoFocus
                                type="number"
                                min={1}
                                placeholder="Quantity to add"
                                className={inputClass}
                                value={stockQty}
                                onChange={(e) => setStockQty(e.target.value)}
                            />
                            {stockError && (
                                <p className="text-sm text-route">
                                    {stockError}
                                </p>
                            )}
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStockTarget(null)}
                                    className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingStock}
                                    className="flex items-center gap-2 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-60"
                                >
                                    {addingStock && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Add stock
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
                        <h2 className="font-display text-lg font-semibold text-ink">
                            Delete product?
                        </h2>
                        <p className="mt-2 text-sm text-ink/60">
                            This will permanently remove{" "}
                            <span className="font-medium text-ink">
                                {deleteTarget.name}
                            </span>
                            . This can't be undone.
                        </p>
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 rounded-md bg-route px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
                            >
                                {deleting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
