import ProductCard from "../Home/ProductCard.tsx";
import type { Product } from "../../../types/products";

interface SearchDropdownProps {
    search: string;
    searchedProducts: Product[];
}

export default function SearchDropdown({
    search,
    searchedProducts,
}: SearchDropdownProps) {
    return (
        search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 z-50">
                {searchedProducts.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                        No products found
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {searchedProducts.slice(0, 6).map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        )
    );
}

export { SearchDropdown };
