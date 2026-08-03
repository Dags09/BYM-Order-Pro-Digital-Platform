import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faSearch,
    faPenToSquare,
    faTrash,
    faTag,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { Toast } from "../../components/customer/Profile/Tost";
import { CategoryModal } from "../../components/admin/Categories/CategoryModal";
import { CategoryDeleteModal } from "../../components/admin/Categories/CategoryDeleteModal";
import type { Category } from "../../types/category";
import type { ToastType } from "../../types/ui";

interface ToastState {
    msg: string;
    type: ToastType;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selected, setSelected] = useState<Category | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = (msg: string, type: ToastType = "success") =>
        setToast({ msg, type });

    const fetchCategories = async () => {
        try {
            const res = await api.get("/category/get-all-categories");
            setCategories(res.data ?? []);
        } catch (err) {
            showToast("Failed to load categories.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
    );

    const openCreate = () => {
        setSelected(null);
        setShowModal(true);
    };

    const openEdit = (category: Category) => {
        setSelected(category);
        setShowModal(true);
    };

    const openDelete = (category: Category) => {
        setSelected(category);
        setShowDeleteModal(true);
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Categories
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {categories.length} total categories
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="relative">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-600"
                    />
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon
                            icon={faTag}
                            className="text-slate-300 text-xl"
                        />
                    </div>
                    <p className="text-slate-400 text-sm">
                        No categories found
                    </p>
                    <button
                        onClick={openCreate}
                        className="mt-4 text-green-700 text-sm font-medium hover:underline"
                    >
                        Create your first category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((c) => (
                        <div
                            key={c._id}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faTag}
                                    className="text-green-700 text-lg"
                                />
                            </div>

                            {/* Info */}
                            <h3 className="font-semibold text-slate-800 truncate">
                                {c.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {c.description || "No description"}
                            </p>

                            {/* Date */}
                            <p className="text-xs text-slate-300 mt-3">
                                Created{" "}
                                {new Date(c.createdAt ?? "").toLocaleDateString(
                                    "en-PH",
                                    {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    },
                                )}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openEdit(c)}
                                    className="flex-1 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 hover:bg-green-100 transition font-medium"
                                >
                                    <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className="mr-1"
                                    />
                                    Edit
                                </button>
                                <button
                                    onClick={() => openDelete(c)}
                                    className="flex-1 py-1.5 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100 transition font-medium"
                                >
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="mr-1"
                                    />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showModal && (
                <CategoryModal
                    category={selected}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        showToast(
                            selected
                                ? "Category updated successfully."
                                : "Category created successfully.",
                        );
                        fetchCategories();
                    }}
                />
            )}

            {showDeleteModal && selected && (
                <CategoryDeleteModal
                    category={selected}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={() => {
                        setShowDeleteModal(false);
                        showToast("Category deleted successfully.");
                        fetchCategories();
                    }}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
