import { useEffect, useState } from "react";
import { Search, Tags } from "lucide-react";
import api from "../../lib/axios";
import type { Category } from "../../types/category";
import { formatShortDate } from "../../utils/formatters";
import { PageSkeleton } from "../../components/skeletonLoader";

interface CategoryWithAuthor extends Category {
    addedBy?: { firstName: string; lastName: string } | null;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithAuthor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/category/get-all-categories")
            .then(({ data }) => setCategories(data))
            .catch(() => setError("Couldn't load categories."))
            .finally(() => setLoading(false));
    }, []);

    const filtered = categories.filter((c) =>
        search.trim()
            ? c.name.toLowerCase().includes(search.trim().toLowerCase())
            : true,
    );

    if (loading) {
        return <PageSkeleton variant="table" />;
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
                    Categories
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Catalog oversight. Adding, editing, and deleting are handled
                    by managers.
                </p>
            </div>

            <div className="relative sm:w-72">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
                    strokeWidth={1.75}
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories"
                    className="w-full rounded-md border-2 border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-ink/10 bg-white p-10 text-center shadow-sm">
                    <Tags
                        className="mx-auto h-8 w-8 text-ink/20"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/50">
                        {categories.length === 0
                            ? "No categories yet."
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
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c) => (
                                    <tr
                                        key={c._id}
                                        className="border-b border-ink/5 last:border-0"
                                    >
                                        <td className="px-5 py-3 font-medium text-ink">
                                            {c.name}
                                        </td>
                                        <td className="max-w-xs truncate px-5 py-3 text-ink/60">
                                            {c.description || "—"}
                                        </td>
                                        <td className="px-5 py-3 text-ink/60">
                                            {c.addedBy
                                                ? `${c.addedBy.firstName} ${c.addedBy.lastName}`
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-3 text-ink/50">
                                            {c.createdAt
                                                ? formatShortDate(c.createdAt)
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
