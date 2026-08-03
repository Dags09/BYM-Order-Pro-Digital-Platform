interface ProductStockModalProps {
    productName?: string;
    currentStock?: number;
    quantity: string;
    onChange: (value: string) => void;
    onConfirm: () => void;
    onClose: () => void;
}

export function ProductStockModal({
    productName,
    currentStock,
    quantity,
    onChange,
    onConfirm,
    onClose,
}: ProductStockModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
                <h3 className="font-bold text-slate-800 text-lg mb-1">
                    Add Stock
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                    Current stock for{" "}
                    <span className="font-semibold text-slate-600">
                        {productName}
                    </span>
                    : {currentStock}
                </p>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                        Quantity to Add
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => onChange(e.target.value)}
                        min="1"
                        placeholder="Enter quantity"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!quantity || Number(quantity) <= 0}
                        className="flex-1 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition disabled:opacity-50"
                    >
                        Add Stock
                    </button>
                </div>
            </div>
        </div>
    );
}
