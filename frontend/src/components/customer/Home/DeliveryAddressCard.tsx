import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore.ts";

export default function DeliveryAddressCard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const addr = (user as any)?.location;
    const addrStr = addr
        ? [addr.address, addr.city, addr.province].filter(Boolean).join(", ")
        : null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-800 text-sm">
                    Deliver to
                </p>
                <button
                    onClick={() => navigate("/customer/profile")}
                    className="text-xs text-green-700 font-medium hover:underline flex items-center gap-1"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />{" "}
                    Edit
                </button>
            </div>
            {addrStr ? (
                <div className="flex items-start gap-2">
                    <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-green-700 mt-0.5 flex-shrink-0"
                    />
                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Home
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {addrStr}
                        </p>
                        {addr?.zipCode && (
                            <p className="text-xs text-slate-400">
                                {addr.zipCode}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-3">
                    <p className="text-xs text-slate-400 mb-2">
                        No address set
                    </p>
                    <button
                        onClick={() => navigate("/customer/profile")}
                        className="text-xs text-green-700 font-medium hover:underline"
                    >
                        Add address →
                    </button>
                </div>
            )}
        </div>
    );
}

export { DeliveryAddressCard };
