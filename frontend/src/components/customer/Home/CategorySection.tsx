import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useCustomerHomeData } from "../../../hooks/useCustomerHomeData";

export default function CategorySection() {
    const navigate = useNavigate();
    const { categories } = useCustomerHomeData();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-slate-800">Shop by Category</p>
                <button
                    onClick={() => navigate("/customer/shop")}
                    className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1"
                >
                    View all{" "}
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
            </div>
            {categories.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                    No categories yet
                </p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {categories.slice(0, 6).map((c) => (
                        <button
                            key={c._id}
                            onClick={() =>
                                navigate(`/customer/shop?category=${c._id}`)
                            }
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition group"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
                                <FontAwesomeIcon
                                    icon={faTag}
                                    className="text-green-600 text-lg"
                                />
                            </div>
                            <p className="text-xs text-slate-600 font-medium text-center leading-tight">
                                {c.name}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export { CategorySection };
