import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { useCustomerHomeData } from "../../hooks/useCustomerHomeData";
import { useSearchHistory } from "../../hooks/useSearchHistory";
import { getRecommendedProducts } from "../../hooks/useRecommendedProducts";
import useAuthStore from "../../store/authStore.ts";
import PaymentModal from "../../components/customer/PaymentModal";
import { DeliveryTracker } from "../../components/customer/Home/DeliveryTracker.tsx";
import { RecommendedProducts } from "../../components/customer/Home/RecommendedProducts.tsx";
import { RecentOrders } from "../../components/customer/Home/RecentOrders.tsx";
import { DeliveryAddressCard } from "../../components/customer/Home/DeliveryAddressCard.tsx";
import { CategorySection } from "../../components/customer/Home/CategorySection.tsx";
import { SearchDropdown } from "../../components/customer/Home/SearchDropdown.tsx";

type CheckoutOutletContext = {
    showCheckout: boolean;
    setShowCheckout: (value: boolean) => void;
};

export default function CustomerHome() {
    const { user } = useAuthStore();
    const { orders, loading, setOrders, products } = useCustomerHomeData();
    const { search, searchHistory, handleSearchChange } = useSearchHistory();
    const { showCheckout, setShowCheckout } =
        useOutletContext<CheckoutOutletContext>();

    const [orderSuccess, setOrderSuccess] = useState(false);

    const handleOrderSuccess = async () => {
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 4000);
        try {
            const res = await api.get("/order/my-orders");
            setOrders(res.data ?? []);
        } catch {}
    };

    const activeOrder = [...orders]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .find((o) => !["delivered", "cancelled"].includes(o.status));

    const searchedProducts = search
        ? products.filter(
              (p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()) &&
                  p.stock > 0,
          )
        : [];

    const recommendedProducts = getRecommendedProducts(products, searchHistory);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Order success toast */}
            {orderSuccess && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Order placed successfully!
                </div>
            )}

            <div className="space-y-6">
                {/* Welcome + search */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Hello, {user?.firstName}! 👋
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5 mb-4">
                        What would you like to order today?
                    </p>

                    <div className="relative max-w-xl">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-10"
                        />
                        <input
                            type="text"
                            placeholder="Search for products (e.g. rice, milk, eggs)"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                        />

                        {/* Floating dropdown */}
                        <SearchDropdown
                            search={search}
                            searchedProducts={searchedProducts}
                        />
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <CategorySection />
                        {activeOrder && <DeliveryTracker order={activeOrder} />}
                        <RecommendedProducts
                            recommendedProducts={recommendedProducts}
                            hasHistory={searchHistory.length > 0}
                        />
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <DeliveryAddressCard />
                        <RecentOrders />
                    </div>
                </div>
            </div>

            {/* Checkout Modal — triggered by cart drawer via layout */}
            {showCheckout && (
                <PaymentModal
                    orderData={{}}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={handleOrderSuccess}
                />
            )}
        </>
    );
}
