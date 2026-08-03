import { useState } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faXmark,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../lib/axios";
import type { Category, CategoryForm } from "../../../types/category";

interface CategoryModalProps {
    category?: Category | null;
    onClose: () => void;
    onSuccess: () => void;
}

function CategoryModal({ category, onClose, onSuccess }: CategoryModalProps) {
    const [form, setForm] = useState<CategoryForm>({
        name: category?.name || "",
        description: category?.description || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (category) {
                await api.put(
                    `/category/update-category/${category._id}`,
                    form,
                );
            } else {
                await api.post("/category/create-category", form);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <p className="font-semibold text-slate-800">
                            {category ? "Edit Category" : "Add Category"}
                        </p>
                        <p className="text-xs text-slate-400">
                            {category
                                ? "Update category details"
                                : "Create a new product category"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Category Name
                        </label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="e.g. Electronics"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Description{" "}
                            <span className="text-slate-300">(optional)</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Brief description of this category..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-700 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                            )}
                            {loading
                                ? "Saving..."
                                : category
                                  ? "Update"
                                  : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export { CategoryModal };
