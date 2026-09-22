import type { Category } from "../../../../types/category";

interface CategoryFilterProps {
    categories: Category[];
    selected: string;
    onSelect: (categoryId: string) => void;
}

export default function CategoryFilter({
    categories,
    selected,
    onSelect,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onSelect("all")}
                className={`rounded-full border-2 px-4 py-1.5 font-mono text-xs transition ${
                    selected === "all"
                        ? "border-ink bg-ink text-kraft"
                        : "border-ink/20 bg-white text-ink/70 hover:border-ink/40"
                }`}
            >
                All
            </button>
            {categories.map((category) => (
                <button
                    key={category._id}
                    type="button"
                    onClick={() => onSelect(category._id)}
                    className={`rounded-full border-2 px-4 py-1.5 font-mono text-xs transition ${
                        selected === category._id
                            ? "border-ink bg-ink text-kraft"
                            : "border-ink/20 bg-white text-ink/70 hover:border-ink/40"
                    }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
