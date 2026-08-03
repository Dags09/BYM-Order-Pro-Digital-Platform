import type { ChangeEvent, FormEvent } from "react";
import type { Category } from "../../../types/category";

interface ProductForm {
    name: string;
    description: string;
    price: string;
    category: string;
    stock: string;
    image: File | null;
}

interface ProductFormModalProps {
    formData: ProductForm;
    categories: Category[];
    selectedProductName?: string;
    selectedProductImageUrl?: string;
    saving: boolean;
    error: string | null;
    isEdit: boolean;
    onChange: (
        e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => void;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
}

export function ProductFormModal({
    formData,
    categories,
    selectedProductImageUrl,
    saving,
    error,
    isEdit,
    onChange,
    onImageChange,
    onSubmit,
    onClose,
}: ProductFormModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-slate-800 text-lg">
                        {isEdit ? "Edit Product" : "Add Product"}
                    </h3>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={onChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={onChange}
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className={isEdit ? "w-full" : "w-1/2"}>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        Price (₱)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={onChange}
                                        required
                                        min="1"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                {!isEdit && (
                                    <div className="w-1/2">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={onChange}
                                            required
                                            min="0"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={onChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-600"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Product Image{" "}
                                    {isEdit && "(leave empty to keep current)"}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onImageChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                {isEdit &&
                                    selectedProductImageUrl &&
                                    !formData.image && (
                                        <img
                                            src={selectedProductImageUrl}
                                            alt="current"
                                            className="mt-2 h-20 rounded-lg object-cover"
                                        />
                                    )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : isEdit
                                  ? "Update"
                                  : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
