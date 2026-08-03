import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faBoxOpen,
    faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { fmt, peso } from "../../../utils/formatters.ts";
import { STATUS_CONFIG } from "../../../utils/constants.ts";
import useCustomerHomeData from "../../../hooks/useCustomerHomeData.ts";

export default function RecentOrders() {
    const { orders } = useCustomerHomeData();
    const navigate = useNavigate();
    const recentOrders = [...orders]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 4);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-800 text-sm">
                    My Recent Orders
                </p>
                <button
                    onClick={() => navigate("/customer/myOrders")}
                    className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1"
                >
                    View all{" "}
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>
            </div>
            {recentOrders.length === 0 ? (
                <div className="text-center py-6">
                    <FontAwesomeIcon
                        icon={faReceipt}
                        className="text-3xl text-gray-200 mb-2"
                    />
                    <p className="text-xs text-slate-400">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {recentOrders.map((o) => {
                        const cfg =
                            STATUS_CONFIG[
                                o.status as keyof typeof STATUS_CONFIG
                            ] ?? STATUS_CONFIG.pending;
                        const thumb = o.items?.[0]?.product?.imageUrl;
                        return (
                            <button
                                key={o._id}
                                onClick={() => navigate("/customer/myOrders")}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left"
                            >
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt=""
                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <FontAwesomeIcon
                                            icon={faBoxOpen}
                                            className="text-gray-300 text-sm"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 font-mono">
                                        #{o._id.slice(-8).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {fmt(o.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-bold text-slate-700">
                                        {peso(o.totalAmount)}
                                    </p>
                                    <span
                                        className={`text-xs font-semibold ${cfg.color}`}
                                    >
                                        {cfg.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export { RecentOrders };
