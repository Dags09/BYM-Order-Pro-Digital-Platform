import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ProductCard from "../Home/ProductCard";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../types/products";

interface RecommendedProductsProps {
    recommendedProducts: Product[];
    hasHistory: boolean;
}

function RecommendedProducts({
    recommendedProducts,
    hasHistory,
}: RecommendedProductsProps) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="font-semibold text-slate-800">
                        Recommended for You
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {hasHistory
                            ? "Based on your searches"
                            : "Popular products"}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/customer/shop")}
                    className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1"
                >
                    View all{" "}
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recommendedProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                ))}
            </div>
        </div>
    );
}

export { RecommendedProducts };
