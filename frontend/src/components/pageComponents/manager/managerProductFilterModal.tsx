import { useEffect, useState } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "../../../types/category";

export type StockFilter =
    | "all"
    | "low-stock"
    | "out-of-stock"
    | "in-stock";

const STOCK_FILTERS: { value: StockFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "out-of-stock", label: "Out of stock" },
    { value: "low-stock", label: "Low stock" },
    { value: "in-stock", label: "In stock" },
];

export default function ManagerProductFilterModal({
    categories,
    categoryFilter,
    stockFilter,
    onApply,
    onClose,
}: {
    categories: Category[];
    categoryFilter: string[];
    stockFilter: StockFilter;
    onApply: (category: string[], stock: StockFilter) => void;
    onClose: () => void;
}) {
    const [selectedCategories, setSelectedCategories] = useState(categoryFilter);
    const [selectedStock, setSelectedStock] = useState(stockFilter);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const resetFilters = () => {
        setSelectedCategories(["all"]);
        setSelectedStock("all");
    };

    const toggleCategory = (id: string) => {
        if (id === "all") {
            setSelectedCategories(["all"]);
            return;
        }
        setSelectedCategories((current) => {
            const selected = current.filter((category) => category !== "all");
            if (selected.includes(id)) {
                const next = selected.filter((category) => category !== id);
                return next.length > 0 ? next : ["all"];
            }
            return [...selected, id];
        });
    };

    const selectStock = (value: StockFilter) => {
        setSelectedStock(value);
    };

    const categoryOptions = [
        { id: "all", name: "All categories" },
        ...categories.map((category) => ({
            id: category._id,
            name: category.name,
        })),
    ];

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
                aria-labelledby="product-filter-title"
                className="flex max-h-[min(85vh,680px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-ink/10 bg-kraft shadow-2xl"
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
                                id="product-filter-title"
                                className="font-display text-lg font-semibold text-ink"
                            >
                                Product filters
                            </h2>
                            <p className="text-xs text-ink/55">
                                Choose a category and stock status
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-crate transition-colors hover:bg-crate/10"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close product filters"
                            className="rounded-md p-2 text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <div className="space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
                    <section aria-labelledby="stock-filter-heading">
                        <div className="mb-3">
                            <h3
                                id="stock-filter-heading"
                                className="text-sm font-semibold text-ink"
                            >
                                Stock status
                            </h3>
                            <p className="mt-0.5 text-xs text-ink/55">
                                Show products by inventory level
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                            {STOCK_FILTERS.map((option) => {
                                const selected =
                                    selectedStock === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => selectStock(option.value)}
                                        className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center text-xs font-semibold transition-colors sm:text-sm ${
                                            selected
                                                ? "border-crate bg-crate/10 text-crate"
                                                : "border-ink/10 bg-white text-ink/70 hover:border-crate/40 hover:bg-crate/5"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                                selected
                                                    ? "border-crate"
                                                    : "border-ink/30"
                                            }`}
                                        >
                                            {selected && (
                                                <span className="h-2.5 w-2.5 rounded-full bg-crate" />
                                            )}
                                        </span>
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section aria-labelledby="category-filter-heading">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <h3
                                    id="category-filter-heading"
                                    className="text-sm font-semibold text-ink"
                                >
                                    Categories
                                </h3>
                                <p className="mt-0.5 text-xs text-ink/55">
                                    Select one or more categories
                                </p>
                            </div>
                            <span className="rounded-full bg-crate/10 px-2.5 py-1 text-xs font-medium text-crate">
                                {selectedCategories.includes("all")
                                    ? "All selected"
                                    : `${selectedCategories.length} selected`}
                            </span>
                        </div>
                        <div className="grid max-h-52 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                            {categoryOptions.map((option) => {
                                const selected =
                                    selectedCategories.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleCategory(option.id)}
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
                                            {option.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
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
                        onClick={() =>
                            onApply(selectedCategories, selectedStock)
                        }
                        className="rounded-md bg-signal px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-signal-dark"
                    >
                        Apply filters
                    </button>
                </footer>
            </section>
        </div>
    );
}
