import { useEffect, useState, useCallback, type FormEvent } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    Loader2,
    Tag,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import api from "../../lib/axios";
import type { Category } from "../../types/category";
import { formatShortDate } from "../../utils/formatters";

const PAGE_SIZE = 9;

const emptyForm = { name: "", description: "" };

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    // Mongo's raw duplicate-key error isn't user-friendly — translate it.
    if (message?.includes("E11000") || message?.includes("duplicate key")) {
        return "A category with this name already exists.";
    }
    return message ?? fallback;
}

export default function ManagerCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Create / edit modal
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadCategories = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get("/category/get-all-categories")
            .then(({ data }) => setCategories(data))
            .catch(() => setError("Couldn't load categories."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const filtered = categories.filter((c) =>
        search.trim()
            ? c.name.toLowerCase().includes(search.trim().toLowerCase())
            : true,
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );
    const rangeStart =
        filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const openCreateForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError(null);
        setShowForm(true);
    };

    const openEditForm = (category: Category) => {
        setEditingId(category._id);
        setForm({
            name: category.name,
            description: category.description ?? "",
        });
        setFormError(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/category/update-category/${editingId}`, form);
            } else {
                await api.post("/category/create-category", form);
            }
            closeForm();
            loadCategories();
        } catch (err) {
            setFormError(getErrorMessage(err, "Couldn't save this category."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/category/delete-category/${deleteTarget._id}`);
            setDeleteTarget(null);
            loadCategories();
        } catch (err) {
            setError(getErrorMessage(err, "Couldn't delete this category."));
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
                        Categories
                    </h1>
                    <p className="mt-1 text-sm text-ink/60">
                        Create, edit, and remove product categories.
                    </p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center justify-center gap-1.5 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark"
                >
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                    Add category
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {error}
                </div>
            )}

            <div className="relative">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
                    strokeWidth={1.75}
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories"
                    className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate sm:w-72"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/50 p-10 text-center">
                    <Tag
                        className="mx-auto h-8 w-8 text-ink/30"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/60">
                        {categories.length === 0
                            ? "No categories yet. Add one above."
                            : "No categories match this search."}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/40">
                                    <th className="px-5 py-3 font-medium">
                                        Name
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Description
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Added by
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Created
                                    </th>
                                    <th className="px-5 py-3 font-medium text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((category) => {
                                    const addedBy = (
                                        category as Category & {
                                            addedBy?: {
                                                firstName?: string;
                                                lastName?: string;
                                            } | null;
                                            createdAt?: string;
                                        }
                                    ).addedBy;
                                    const createdAt = (
                                        category as Category & {
                                            createdAt?: string;
                                        }
                                    ).createdAt;
                                    return (
                                        <tr
                                            key={category._id}
                                            className="border-b border-ink/5 last:border-0"
                                        >
                                            <td className="px-5 py-3 font-medium text-ink">
                                                {category.name}
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 text-ink/60">
                                                {category.description || (
                                                    <span className="text-ink/30">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-ink/50">
                                                {addedBy
                                                    ? `${addedBy.firstName ?? ""} ${addedBy.lastName ?? ""}`.trim()
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-ink/50">
                                                {createdAt
                                                    ? formatShortDate(createdAt)
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openEditForm(
                                                                category,
                                                            )
                                                        }
                                                        className="flex items-center gap-1 rounded-md border border-ink/15 px-2.5 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-ink/5"
                                                    >
                                                        <Pencil
                                                            className="h-3.5 w-3.5"
                                                            strokeWidth={1.75}
                                                        />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                category,
                                                            )
                                                        }
                                                        className="flex items-center justify-center rounded-md border border-route/20 p-1.5 text-route transition-colors hover:bg-route/5"
                                                        title="Delete category"
                                                    >
                                                        <Trash2
                                                            className="h-3.5 w-3.5"
                                                            strokeWidth={1.75}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filtered.length > 0 && totalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-4 sm:flex-row">
                    <p className="text-xs text-ink/50">
                        Showing {rangeStart}–{rangeEnd} of {filtered.length}{" "}
                        categor{filtered.length === 1 ? "y" : "ies"}
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
                    <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold text-ink">
                                {editingId ? "Edit category" : "Add category"}
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
                                    autoFocus
                                    maxLength={60}
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
                                        : "Create category"}
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
                            Delete category?
                        </h2>
                        <p className="mt-2 text-sm text-ink/60">
                            This will permanently remove{" "}
                            <span className="font-medium text-ink">
                                {deleteTarget.name}
                            </span>
                            . Products already assigned to it won't be
                            reassigned automatically.
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
