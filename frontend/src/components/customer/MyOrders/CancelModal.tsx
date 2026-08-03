import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTriangleExclamation,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import type { Order, OrderItem } from "../../../types/orders";

function CancelModal({
    order,
    onClose,
    onConfirm,
    cancelling,
}: {
    order: Order;
    onClose: () => void;
    onConfirm: () => void;
    cancelling: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className="text-red-500 text-xl"
                    />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Cancel Order?
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                    Are you sure you want to cancel order{" "}
                    <span className="font-semibold text-slate-600 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                    </span>
                    ?
                </p>
                <p className="text-xs text-slate-300 mb-6">
                    Stock will be restored automatically.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                    >
                        Keep Order
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={cancelling}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {cancelling && (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin"
                            />
                        )}
                        Cancel Order
                    </button>
                </div>
            </div>
        </div>
    );
}
export { CancelModal };
