import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faDownload,
    faCheckCircle,
    faReceipt,
    faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { peso, fmt } from "../../utils/formatters";
import { PAYMENT_LABELS } from "../../utils/constants";
import type { Order } from "../../types/orders";

interface ReceiptModalProps {
    order: Order;
    onClose: () => void;
}

// ── Printable receipt (hidden, used only for PDF download) ───────────────────
function PrintableReceipt({ order }: { order: Order }) {
    const addr = order.shippingAddress;
    const addrStr = addr
        ? [addr.street, addr.city, addr.province, addr.zipCode]
              .filter(Boolean)
              .join(", ")
        : null;

    const subtotal =
        order.items?.reduce(
            (sum, item) => sum + item.price * (item.quantity ?? item.qty ?? 1),
            0,
        ) ?? order.totalAmount;

    return (
        <div
            id="printable-receipt"
            style={{
                fontFamily: "'Segoe UI', Arial, sans-serif",
                width: "520px",
                margin: "0 auto",
                padding: "40px 36px",
                color: "#1e293b",
                background: "#fff",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "#dcfce7",
                        marginBottom: "10px",
                    }}
                >
                    <span style={{ fontSize: "22px" }}>🧾</span>
                </div>
                <h1
                    style={{
                        margin: "0 0 4px",
                        fontSize: "22px",
                        fontWeight: "800",
                        color: "#15803d",
                        letterSpacing: "-0.5px",
                    }}
                >
                    Order Receipt
                </h1>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                    Thank you for your order!
                </p>
            </div>

            {/* Divider */}
            <div
                style={{
                    borderTop: "2px dashed #e2e8f0",
                    marginBottom: "20px",
                }}
            />

            {/* Order meta */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    fontSize: "12px",
                    gap: "8px",
                }}
            >
                <div>
                    <p
                        style={{
                            margin: "0 0 2px",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: "10px",
                            fontWeight: "700",
                        }}
                    >
                        Order ID
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontWeight: "700",
                            fontFamily: "monospace",
                            fontSize: "13px",
                        }}
                    >
                        #{(order._id ?? "").slice(-8).toUpperCase()}
                    </p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p
                        style={{
                            margin: "0 0 2px",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: "10px",
                            fontWeight: "700",
                        }}
                    >
                        Date
                    </p>
                    <p
                        style={{
                            margin: 0,
                            fontWeight: "600",
                            fontSize: "12px",
                        }}
                    >
                        {fmt(order.createdAt)}
                    </p>
                </div>
            </div>

            {/* Delivery address */}
            {addrStr && (
                <div
                    style={{
                        background: "#f8fafc",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        marginBottom: "20px",
                        fontSize: "12px",
                    }}
                >
                    <p
                        style={{
                            margin: "0 0 4px",
                            color: "#94a3b8",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: "10px",
                            fontWeight: "700",
                        }}
                    >
                        Deliver To
                    </p>
                    <p style={{ margin: 0, color: "#475569" }}>{addrStr}</p>
                </div>
            )}

            {/* Items table */}
            <div style={{ marginBottom: "20px" }}>
                <p
                    style={{
                        margin: "0 0 10px",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: "10px",
                        fontWeight: "700",
                    }}
                >
                    Items Ordered
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr
                            style={{
                                background: "#f1f5f9",
                                fontSize: "11px",
                                color: "#64748b",
                            }}
                        >
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "left",
                                    borderRadius: "6px 0 0 6px",
                                    fontWeight: "700",
                                }}
                            >
                                Item
                            </th>
                            <th
                                style={{
                                    padding: "8px 6px",
                                    textAlign: "center",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Unit Price
                            </th>
                            <th
                                style={{
                                    padding: "8px 6px",
                                    textAlign: "center",
                                    fontWeight: "700",
                                }}
                            >
                                Qty
                            </th>
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    borderRadius: "0 6px 6px 0",
                                    fontWeight: "700",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, i) => (
                            <tr
                                key={i}
                                style={{
                                    borderBottom: "1px solid #f1f5f9",
                                    fontSize: "12px",
                                }}
                            >
                                <td
                                    style={{
                                        padding: "10px 10px",
                                        color: "#334155",
                                        fontWeight: "500",
                                    }}
                                >
                                    {item.product?.name ?? item.name ?? "Item"}
                                </td>
                                <td
                                    style={{
                                        padding: "10px 6px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    {peso(item.price)}
                                </td>
                                <td
                                    style={{
                                        padding: "10px 6px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    {item.quantity ?? item.qty ?? 1}
                                </td>
                                <td
                                    style={{
                                        padding: "10px 10px",
                                        textAlign: "right",
                                        fontWeight: "700",
                                        color: "#1e293b",
                                    }}
                                >
                                    {peso(
                                        item.price *
                                            (item.quantity ?? item.qty ?? 1),
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div
                style={{
                    background: "#f8fafc",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "8px",
                    }}
                >
                    <span>Subtotal</span>
                    <span>{peso(subtotal)}</span>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "12px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid #e2e8f0",
                    }}
                >
                    <span>Delivery Fee</span>
                    <span style={{ color: "#15803d", fontWeight: "600" }}>
                        FREE
                    </span>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "16px",
                        fontWeight: "800",
                    }}
                >
                    <span style={{ color: "#1e293b" }}>Total Payment</span>
                    <span style={{ color: "#15803d" }}>
                        {peso(order.totalAmount)}
                    </span>
                </div>
            </div>

            {/* Payment method */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "20px",
                    padding: "12px 14px",
                    background: "#f0fdf4",
                    borderRadius: "10px",
                    border: "1px solid #bbf7d0",
                }}
            >
                <span style={{ color: "#64748b", fontWeight: "600" }}>
                    Payment Method
                </span>
                <span style={{ color: "#15803d", fontWeight: "700" }}>
                    {PAYMENT_LABELS[
                        order.paymentMethod as keyof typeof PAYMENT_LABELS
                    ] ??
                        order.paymentMethod ??
                        "—"}
                </span>
            </div>

            {/* Footer */}
            <div
                style={{
                    borderTop: "2px dashed #e2e8f0",
                    paddingTop: "18px",
                    textAlign: "center",
                }}
            >
                <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#15803d",
                    }}
                >
                    Thank you for shopping with us! 🌿
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                    Keep this receipt as proof of purchase.
                </p>
            </div>
        </div>
    );
}

// ── Receipt Modal ─────────────────────────────────────────────────────────────
export default function ReceiptModal({ order, onClose }: ReceiptModalProps) {
    const addr = order.shippingAddress;
    const addrStr = addr
        ? [addr.street, addr.city, addr.province, addr.zipCode]
              .filter(Boolean)
              .join(", ")
        : null;

    const subtotal =
        order.items?.reduce(
            (sum, item) =>
                sum + item.price * (item.quantity ?? item.quantity ?? 1),
            0,
        ) ?? order.totalAmount;

    const handleDownload = () => {
        const printContent = document.getElementById("printable-receipt");
        if (!printContent) return;

        const printWindow = window.open("", "_blank", "width=700,height=900");
        if (!printWindow) return;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - #${(order._id ?? "").slice(-8).toUpperCase()}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { background: #fff; }
                    @media print {
                        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${printContent.outerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <>
            {/* Hidden printable element */}
            <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                <PrintableReceipt order={order} />
            </div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                                <FontAwesomeIcon
                                    icon={faReceipt}
                                    className="text-green-700"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">
                                    Order Receipt
                                </p>
                                <p className="text-xs text-slate-400 font-mono">
                                    #{(order._id ?? "").slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Success banner (only when shown right after payment) */}
                        {order._justPlaced && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-emerald-500 text-lg flex-shrink-0"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700">
                                        Order placed successfully!
                                    </p>
                                    <p className="text-xs text-emerald-600">
                                        We'll notify you once it's being
                                        prepared.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                    Order Date
                                </p>
                                <p className="text-xs font-medium text-slate-700">
                                    {fmt(order.createdAt)}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                    Payment
                                </p>
                                <p className="text-xs font-medium text-slate-700">
                                    {PAYMENT_LABELS[
                                        order.paymentMethod as keyof typeof PAYMENT_LABELS
                                    ] ??
                                        order.paymentMethod ??
                                        "—"}
                                </p>
                            </div>
                        </div>

                        {/* Delivery address */}
                        {addrStr && (
                            <div className="bg-gray-50 rounded-xl p-3 text-xs text-slate-600">
                                <p className="font-semibold text-slate-400 uppercase tracking-wide text-xs mb-1">
                                    Deliver To
                                </p>
                                {addrStr}
                            </div>
                        )}

                        {/* Items */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Items Ordered
                            </p>
                            <div className="space-y-2">
                                {order.items?.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                                    >
                                        {item.product?.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <FontAwesomeIcon
                                                    icon={faBoxOpen}
                                                    className="text-gray-400 text-xs"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {item.product?.name ??
                                                    item.name ??
                                                    "Item"}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {peso(item.price)} ×{" "}
                                                {item.quantity ?? item.qty ?? 1}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 flex-shrink-0">
                                            {peso(
                                                item.price *
                                                    (item.quantity ??
                                                        item.qty ??
                                                        1),
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>Subtotal</span>
                                <span>{peso(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>Delivery Fee</span>
                                <span className="text-green-600 font-semibold">
                                    FREE
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <span className="font-bold text-slate-800">
                                    Total Payment
                                </span>
                                <span className="text-xl font-bold text-green-700">
                                    {peso(order.totalAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition flex items-center justify-center gap-2"
                            >
                                <FontAwesomeIcon icon={faDownload} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
