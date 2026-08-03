import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faSearch,
    faTableCells,
    faList,
    faPenToSquare,
    faTrash,
    faBoxOpen,
    faImage,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { peso } from "../../utils/formatters";
import { ProductFormModal } from "../../components/admin/Products/ProductFormModal";
import { ProductDeleteModal } from "../../components/admin/Products/ProductDeleteModal";
import { ProductStockModal } from "../../components/admin/Products/ProductStockModal";

interface ProductCategory {
    _id: string;
    name: string;
}
interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: ProductCategory;
}
interface Category {
    _id: string;
    name: string;
}
interface ProductForm {
    name: string;
    description: string;
    price: string;
    category: string;
    stock: string;
    image: File | null;
}

const EMPTY_FORM: ProductForm = {
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
};

type ViewMode = "table" | "grid";

function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>("table");
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [stockQuantity, setStockQuantity] = useState("");
    const [formData, setFormData] = useState<ProductForm>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                api.get("/product/get-all-products"),
                api.get("/category/get-all-categories"),
            ]);
            setProducts(pRes.data ?? []);
            setCategories(cRes.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory
            ? p.category?._id === filterCategory
            : true;
        return matchSearch && matchCategory;
    });

    const openCreate = () => {
        setSelectedProduct(null);
        setFormData(EMPTY_FORM);
        setError(null);
        setShowModal(true);
    };

    const openEdit = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: String(product.price),
            category: product.category?._id ?? "",
            stock: String(product.stock),
            image: null,
        });
        setError(null);
        setShowModal(true);
    };

    const openDelete = (product: Product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };
    const openStock = (product: Product) => {
        setSelectedProduct(product);
        setStockQuantity("");
        setShowStockModal(true);
    };

    const handleChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, image: e.target.files?.[0] ?? null });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("price", formData.price);
            data.append("category", formData.category);
            data.append("stock", formData.stock);
            if (formData.image) data.append("image", formData.image);
            if (selectedProduct) {
                await api.put(
                    `/product/update-product/${selectedProduct._id}`,
                    data,
                );
            } else {
                await api.post("/product/create-product", data);
            }
            await fetchData();
            setShowModal(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedProduct) return;
        try {
            await api.delete(`/product/delete-product/${selectedProduct._id}`);
            await fetchData();
            setShowDeleteModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddStock = async () => {
        if (!selectedProduct) return;
        try {
            await api.post(`/product/add-stock/${selectedProduct._id}`, {
                quantity: Number(stockQuantity),
            });
            await fetchData();
            setShowStockModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const stockBadge = (stock: number) => {
        if (stock === 0)
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    Out of Stock
                </span>
            );
        if (stock <= 10)
            return (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    Low Stock
                </span>
            );
        return (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                In Stock
            </span>
        );
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Products
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {products.length} total products
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                >
                    <FontAwesomeIcon icon={faPlus} /> Add Product
                </button>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-600"
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 max-w-fit">
                    <button
                        onClick={() => setView("table")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${view === "table" ? "bg-white shadow text-green-700" : "text-slate-500"}`}
                    >
                        <FontAwesomeIcon icon={faList} />
                    </button>
                    <button
                        onClick={() => setView("grid")}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${view === "grid" ? "bg-white shadow text-green-700" : "text-slate-500"}`}
                    >
                        <FontAwesomeIcon icon={faTableCells} />
                    </button>
                </div>
            </div>

            {view === "table" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {[
                                        "Product",
                                        "Category",
                                        "Price",
                                        "Stock",
                                        "Status",
                                        "Actions",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left px-5 py-3 text-slate-500 font-medium"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-12 text-slate-400"
                                        >
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p) => (
                                        <tr
                                            key={p._id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.imageUrl ? (
                                                        <img
                                                            src={p.imageUrl}
                                                            alt={p.name}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-slate-400">
                                                            <FontAwesomeIcon
                                                                icon={faImage}
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-slate-700">
                                                            {p.name}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate max-w-xs">
                                                            {p.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {p.category?.name || "—"}
                                            </td>
                                            <td className="px-5 py-3 font-semibold text-slate-700">
                                                {peso(p.price)}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {p.stock}
                                            </td>
                                            <td className="px-5 py-3">
                                                {stockBadge(p.stock)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openStock(p)
                                                        }
                                                        className="px-2.5 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faBoxOpen}
                                                        />{" "}
                                                        Add Stock
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openEdit(p)
                                                        }
                                                        className="px-2.5 py-1.5 rounded-lg text-xs bg-green-50 text-green-600 hover:bg-green-100 transition"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faPenToSquare}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openDelete(p)
                                                        }
                                                        className="px-2.5 py-1.5 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100 transition"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            No products found
                        </div>
                    ) : (
                        filtered.map((p) => (
                            <div
                                key={p._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                            >
                                {p.imageUrl ? (
                                    <img
                                        src={p.imageUrl}
                                        alt={p.name}
                                        className="w-full h-44 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-3xl text-slate-300">
                                        <FontAwesomeIcon icon={faImage} />
                                    </div>
                                )}
                                <div className="p-4">
                                    <p className="font-semibold text-slate-800 truncate">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                                        {p.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="font-bold text-green-700">
                                            {peso(p.price)}
                                        </p>
                                        {stockBadge(p.stock)}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {p.category?.name || "No category"}
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => openStock(p)}
                                            className="flex-1 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                        >
                                            <FontAwesomeIcon icon={faBoxOpen} />{" "}
                                            Stock
                                        </button>
                                        <button
                                            onClick={() => openEdit(p)}
                                            className="flex-1 py-1.5 rounded-lg text-xs bg-green-50 text-green-600 hover:bg-green-100 transition"
                                        >
                                            <FontAwesomeIcon
                                                icon={faPenToSquare}
                                            />{" "}
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDelete(p)}
                                            className="flex-1 py-1.5 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100 transition"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />{" "}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <ProductFormModal
                    formData={formData}
                    categories={categories}
                    selectedProductName={selectedProduct?.name}
                    selectedProductImageUrl={selectedProduct?.imageUrl}
                    saving={saving}
                    error={error}
                    isEdit={!!selectedProduct}
                    onChange={handleChange}
                    onImageChange={handleImageChange}
                    onSubmit={handleSubmit}
                    onClose={() => setShowModal(false)}
                />
            )}
            {showDeleteModal && (
                <ProductDeleteModal
                    productName={selectedProduct?.name}
                    onConfirm={handleDelete}
                    onClose={() => setShowDeleteModal(false)}
                />
            )}
            {showStockModal && (
                <ProductStockModal
                    productName={selectedProduct?.name}
                    currentStock={selectedProduct?.stock}
                    quantity={stockQuantity}
                    onChange={setStockQuantity}
                    onConfirm={handleAddStock}
                    onClose={() => setShowStockModal(false)}
                />
            )}
        </div>
    );
}

export default Products;
