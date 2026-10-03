import { useEffect, useState } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "../../../../types/category";

export default function ShopFilterModal({
    categories,
    selectedCategories,
    onApply,
    onClose,
}: {
    categories: Category[];
    selectedCategories: string[];
    onApply: (categoryIds: string[]) => void;
    onClose: () => void;
}) {
    const [selection, setSelection] = useState(selectedCategories);
    const [categorySearch, setCategorySearch] = useState("");

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const toggleCategory = (id: string) => {
        setSelection((current) =>
            current.includes(id)
                ? current.filter((categoryId) => categoryId !== id)
                : [...current, id],
        );
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.trim().toLowerCase()),
    );

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="shop-filter-title"
                className="flex max-h-[min(85vh,680px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-ink/10 bg-kraft shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-crate/10 text-crate">
                            <SlidersHorizontal
                                className="h-5 w-5"
                                strokeWidth={1.75}
                            />
                        </span>
                        <div>
                            <h2
                                id="shop-filter-title"
                                className="font-display text-lg font-semibold text-ink"
                            >
                                Shop filters
                            </h2>
                            <p className="text-xs text-ink/55">
                                Select one or more categories
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setSelection([])}
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-crate transition-colors hover:bg-crate/10"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close shop filters"
                            className="rounded-md p-2 text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <div className="overflow-y-auto px-5 py-5 sm:px-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-ink">
                                Categories
                            </h3>
                            <p className="mt-0.5 text-xs text-ink/55">
                                Products in any selected category will be shown
                            </p>
                        </div>
                        <span className="rounded-full bg-crate/10 px-2.5 py-1 text-xs font-medium text-crate">
                            {selection.length === 0
                                ? "No filters"
                                : `${selection.length} selected`}
                        </span>
                    </div>

                    <div className="relative mb-3">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                        <input
                            type="search"
                            value={categorySearch}
                            onChange={(event) =>
                                setCategorySearch(event.target.value)
                            }
                            placeholder="Search categories"
                            aria-label="Search categories"
                            className="w-full rounded-md border-2 border-ink/15 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate"
                        />
                    </div>

                    {categories.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-center text-sm text-ink/55">
                            No categories available.
                        </p>
                    ) : filteredCategories.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-ink/20 bg-white/60 p-6 text-center text-sm text-ink/55">
                            No categories match your search.
                        </p>
                    ) : (
                        <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                            {filteredCategories.map((category) => {
                                const selected = selection.includes(
                                    category._id,
                                );
                                return (
                                    <button
                                        key={category._id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            toggleCategory(category._id)
                                        }
                                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition-colors ${
                                            selected
                                                ? "border-crate bg-white text-crate"
                                                : "border-ink/10 bg-white/70 text-ink hover:border-crate/40 hover:bg-white"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                                selected
                                                    ? "border-crate"
                                                    : "border-ink/30"
                                            }`}
                                        >
                                            {selected && (
                                                <span className="h-2 w-2 rounded-full bg-crate" />
                                            )}
                                        </span>
                                        <span className="truncate">
                                            {category.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-between border-t border-ink/10 bg-white px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onApply(selection)}
                        className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-signal-dark"
                    >
                        Apply filters
                    </button>
                </footer>
            </section>
        </div>
    );
}
