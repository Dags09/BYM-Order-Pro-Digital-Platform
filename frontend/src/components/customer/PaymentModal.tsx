import {
    useState,
    useEffect,
    useRef,
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faXmark,
    faSpinner,
    faMoneyBill,
    faMobileScreen,
    faCheckCircle,
    faLocationDot,
    faCopy,
    faImage,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore.ts";
import { useCart } from "../../layout/CustomerSideNavBar";
import ReceiptModal from "./ReceiptModal.tsx";
import { peso } from "../../utils/formatters";

type PaymentMethodCardProps = {
    id: string;
    label: string;
    description: string;
    icon: IconDefinition;
    selected: boolean;
    onSelect: (id: string) => void;
    color: string;
    disabled?: boolean;
};

type QRCode = {
    type: "gcash" | "maya" | string;
    accountName: string;
    accountNumber: string;
    imageUrl: string;
};

type QRPaymentStepProps = {
    qrcode: QRCode;
    totalAmount: number;
    reference: string;
    setReference: Dispatch<SetStateAction<string>>;
    setProof: Dispatch<SetStateAction<File | null>>;
    onBack: () => void;
};

type LocationPayload = {
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
};

type PaymentModalProps = {
    orderData?: unknown;
    onClose: () => void;
    onSuccess: () => void;
};

function PaymentMethodCard({
    id,
    label,
    description,
    icon,
    selected,
    onSelect,
    color,
    disabled,
}: PaymentMethodCardProps) {
    return (
        <button
            onClick={() => !disabled && onSelect(id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left
                ${
                    disabled
                        ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                        : selected
                          ? "border-green-600 bg-green-50"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                }`}
        >
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
            >
                <FontAwesomeIcon icon={icon} className="text-xl text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className={`font-semibold text-sm ${selected && !disabled ? "text-green-700" : "text-slate-700"}`}
                >
                    {label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {disabled ? "Not available" : description}
                </p>
            </div>
            {!disabled && (
                <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                    ${selected ? "border-green-600 bg-green-600" : "border-gray-300"}`}
                >
                    {selected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                </div>
            )}
        </button>
    );
}

function QRPaymentStep({
    qrcode,
    totalAmount,
    reference,
    setReference,
    setProof,
    onBack,
}: QRPaymentStepProps) {
    const [copied, setCopied] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const copyNumber = () => {
        navigator.clipboard.writeText(qrcode.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProof(file);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <div className="space-y-4">
            {/* QR code */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 text-center">
                    Scan to Pay via {qrcode.type === "gcash" ? "GCash" : "Maya"}
                </p>
                <div className="flex justify-center mb-3">
                    <img
                        src={qrcode.imageUrl}
                        alt={`${qrcode.type} QR`}
                        className="w-48 h-48 object-contain rounded-xl border border-gray-200 bg-white p-2"
                    />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-800">
                        {qrcode.accountName}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-sm text-slate-500 font-mono">
                            {qrcode.accountNumber}
                        </p>
                        <button
                            onClick={copyNumber}
                            className="text-green-600 hover:text-green-700 transition"
                        >
                            <FontAwesomeIcon
                                icon={copied ? faCheckCircle : faCopy}
                                className="text-xs"
                            />
                        </button>
                    </div>
                </div>
                <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-center">
                    <p className="text-xs text-green-600">Amount to Pay</p>
                    <p className="text-xl font-bold text-green-700">
                        {peso(totalAmount)}
                    </p>
                </div>
            </div>

            {/* Reference number */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Reference / Transaction Number{" "}
                    <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter your transaction reference number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                    Find this in your{" "}
                    {qrcode.type === "gcash" ? "GCash" : "Maya"} transaction
                    history after payment.
                </p>
            </div>

            {/* Proof upload */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Payment Receipt / Screenshot
                </label>
                {preview ? (
                    <div className="relative mb-2">
                        <img
                            src={preview}
                            alt="proof preview"
                            className="w-full max-h-40 object-contain rounded-xl border border-gray-200 bg-gray-50"
                        />
                        <button
                            onClick={() => {
                                setProof(null);
                                setPreview(null);
                                if (fileRef.current) {
                                    fileRef.current.value = "";
                                }
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center gap-2 text-slate-400 hover:border-green-400 hover:text-green-600 transition"
                    >
                        <FontAwesomeIcon icon={faImage} className="text-2xl" />
                        <p className="text-xs font-medium">
                            Click to upload screenshot
                        </p>
                    </button>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                />
            </div>

            <button
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-slate-600 transition"
            >
                ← Change payment method
            </button>
        </div>
    );
}

export default function PaymentModal({
    orderData: _orderData,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const { items, total, clear } = useCart();
    const { user } = useAuthStore();
    const [step, setStep] = useState("method");
    const [method, setMethod] = useState("cod");
    const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
    const [reference, setReference] = useState<string>("");
    const [proof, setProof] = useState<File | null>(null);
    const [note, setNote] = useState("");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [loadingQR, setLoadingQR] = useState(true);

    // ── NEW: receipt state ────────────────────────────────────────────────────
    const [receiptOrder, setReceiptOrder] = useState<any | null>(null);

    void _orderData;
    const addr = user?.location as LocationPayload | undefined;
    const addrStr = addr
        ? [addr.address, addr.city, addr.province, addr.zipCode]
              .filter(Boolean)
              .join(", ")
        : null;

    useEffect(() => {
        api.get("/qrcode")
            .then((res) => setQrcodes(res.data.qrcodes ?? []))
            .catch(() => {})
            .finally(() => setLoadingQR(false));
    }, []);

    const selectedQR = qrcodes.find((q) => q.type === method);

    const handleMethodContinue = () => {
        if (method === "cod") {
            handlePlaceOrder();
            return;
        }
        if (!selectedQR) {
            setError(
                `No ${method === "gcash" ? "GCash" : "Maya"} QR code available.`,
            );
            return;
        }
        setError("");
        setStep("qr");
    };

    const handlePlaceOrder = async () => {
        if (!addrStr) {
            setError("Please set a delivery address in your profile first.");
            return;
        }
        if (method !== "cod" && !reference.trim()) {
            setError("Please enter your transaction reference number.");
            return;
        }
        setPlacing(true);
        setError("");
        try {
            // 1. Create order
            const res = await api.post("/order/create-order", {
                items: items.map((i) => ({
                    productId: i._id,
                    quantity: i.qty,
                })),
                shippingAddress: {
                    street: addr?.address ?? "",
                    city: addr?.city ?? "",
                    province: addr?.province ?? "",
                    zipCode: addr?.zipCode ?? "",
                    country: addr?.country ?? "Philippines",
                },
                note: note || undefined,
                paymentMethod: method,
                paymentReference: reference.trim() || null,
            });

            // 2. Upload proof if provided
            if (proof && res.data?.order?._id) {
                const formData = new FormData();
                formData.append("image", proof);
                await api.patch(
                    `/order/upload-proof/${res.data.order._id}`,
                    formData,
                );
            }

            clear();
            onSuccess();

            // ── Build receipt order object from cart + API response ──────────
            const placedOrder = res.data?.order ?? {};
            const receiptData = {
                ...placedOrder,
                _justPlaced: true,
                items: items.map((i) => ({
                    product: { name: i.name, imageUrl: i.image },
                    price: i.price,
                    quantity: i.qty,
                })),
                totalAmount: total,
                paymentMethod: method,
                shippingAddress: {
                    street: addr?.address ?? "",
                    city: addr?.city ?? "",
                    province: addr?.province ?? "",
                    zipCode: addr?.zipCode ?? "",
                },
                createdAt: placedOrder.createdAt ?? new Date().toISOString(),
            };
            setReceiptOrder(receiptData);
            // Don't call onClose() yet — show receipt first
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setError(err.response?.data?.message ?? "Failed to place order.");
        } finally {
            setPlacing(false);
        }
    };

    const METHODS = [
        {
            id: "cod",
            label: "Cash on Delivery",
            description: "Pay when your order arrives",
            icon: faMoneyBill,
            color: "bg-emerald-500",
        },
        {
            id: "gcash",
            label: "GCash",
            description: "Scan QR code and upload receipt",
            icon: faMobileScreen,
            color: "bg-blue-500",
            disabled: !loadingQR && !qrcodes.find((q) => q.type === "gcash"),
        },
        {
            id: "maya",
            label: "Maya",
            description: "Scan QR code and upload receipt",
            icon: faMobileScreen,
            color: "bg-green-500",
            disabled: !loadingQR && !qrcodes.find((q) => q.type === "maya"),
        },
    ];

    // ── Show receipt after payment ────────────────────────────────────────────
    if (receiptOrder) {
        return <ReceiptModal order={receiptOrder} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <p className="font-bold text-slate-800">
                            {step === "method"
                                ? "Choose Payment Method"
                                : "Complete Payment"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Total: {peso(total)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Deliver to */}
                    <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
                        <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-green-700 text-sm mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Deliver to
                            </p>
                            <p className="text-sm text-slate-700 mt-0.5">
                                {addrStr ?? (
                                    <span className="text-red-400">
                                        No address set
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Order summary */}
                    <div className="space-y-1.5">
                        {items.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between"
                            >
                                <p className="text-sm text-slate-600 truncate">
                                    {item.name}{" "}
                                    <span className="text-slate-400">
                                        ×{item.qty}
                                    </span>
                                </p>
                                <p className="text-sm font-semibold text-slate-700 ml-2 flex-shrink-0">
                                    {peso(item.price * item.qty)}
                                </p>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className="font-semibold text-slate-700">
                                Total
                            </p>
                            <p className="font-bold text-green-700 text-lg">
                                {peso(total)}
                            </p>
                        </div>
                    </div>

                    {/* Method step */}
                    {step === "method" && (
                        <>
                            {loadingQR ? (
                                <div className="flex justify-center py-4">
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="animate-spin text-green-600 text-xl"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {METHODS.map((m) => (
                                        <PaymentMethodCard
                                            key={m.id}
                                            {...m}
                                            selected={method === m.id}
                                            onSelect={setMethod}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Note field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Note For Delivery Driver (optional)
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Any special instructions?"
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleMethodContinue}
                                    disabled={placing || loadingQR}
                                    className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {placing && (
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="animate-spin"
                                        />
                                    )}
                                    {method === "cod"
                                        ? "Place Order"
                                        : "Continue →"}
                                </button>
                            </div>
                        </>
                    )}

                    {/* QR step */}
                    {step === "qr" && selectedQR && (
                        <>
                            <QRPaymentStep
                                qrcode={selectedQR}
                                totalAmount={total}
                                reference={reference}
                                setReference={setReference}
                                setProof={setProof}
                                onBack={() => {
                                    setStep("method");
                                    setError("");
                                }}
                            />
                            <button
                                onClick={handlePlaceOrder}
                                disabled={
                                    placing || !reference.trim() || !proof
                                }
                                className="w-full py-3 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {placing && (
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="animate-spin"
                                    />
                                )}
                                Confirm & Place Order
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
