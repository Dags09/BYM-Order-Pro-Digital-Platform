import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Truck, Wallet, QrCode, ZoomIn, X } from "lucide-react";
import api from "../../../../lib/axios";
import useAuthStore from "../../../../store/authStore";
import useCartStore from "../../../../store/cartStore";
import { formatPrice } from "../../../../utils/formatters";
import NavBar from "../homePage/navBar";
import Footer from "../homePage/footer";

import type { QRCodeEntry } from "../../../../types/qrcode";
import type {
    CreateOrderResponse,
    PaymentMethod,
    Receipt,
} from "../../../../types/order";

import { Field, ReceiptView } from "./receiptView";

const paymentOptions: {
    value: PaymentMethod;
    label: string;
    description: string;
}[] = [
    {
        value: "cod",
        label: "Cash on Delivery",
        description: "Pay when your order arrives",
    },
    { value: "gcash", label: "GCash", description: "Pay via GCash QR" },
    { value: "maya", label: "Maya", description: "Pay via Maya QR" },
];

export default function CheckoutPage() {
    const user = useAuthStore((state) => state.user);
    const { items, totalPrice, clearCart } = useCartStore();

    const [street, setStreet] = useState(user?.location?.address ?? "");
    const [city, setCity] = useState(user?.location?.city ?? "");
    const [province, setProvince] = useState(user?.location?.province ?? "");
    const [zipCode, setZipCode] = useState(user?.location?.zipCode ?? "");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
    const [paymentReference, setPaymentReference] = useState("");

    const [qrcodes, setQrcodes] = useState<QRCodeEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    useEffect(() => {
        api.get("/qrcode")
            .then(({ data }) => setQrcodes(data.qrcodes ?? []))
            .catch((err) => console.error("Failed to load QR codes:", err));
    }, []);

    const activeQr = useMemo(
        () => qrcodes.find((qr) => qr.type === paymentMethod && qr.isActive),
        [qrcodes, paymentMethod],
    );

    const needsReference =
        paymentMethod === "gcash" || paymentMethod === "maya";

    useEffect(() => {
        setQrModalOpen(false);
    }, [paymentMethod]);

    const handlePlaceOrder = async () => {
        setError(null);

        if (!street || !city || !province || !zipCode) {
            setError("Please complete your shipping address.");
            return;
        }
        if (needsReference && !paymentReference.trim()) {
            setError("Please enter your payment reference number.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post<CreateOrderResponse>(
                "/order/create-order",
                {
                    items: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                    shippingAddress: { street, city, province, zipCode },
                    note: note || undefined,
                    paymentMethod,
                    paymentReference: needsReference
                        ? paymentReference.trim()
                        : undefined,
                },
            );

            clearCart();
            setReceipt(data.receipt);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    "Something went wrong placing your order. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    // Guard: nothing to check out with, and no receipt to show yet.
    if (items.length === 0 && !receipt) {
        return <Navigate to="/cart" replace />;
    }

    return (
        <div>
            <NavBar />

            <main className="min-h-[70vh] bg-kraft px-4 py-10 md:px-8 lg:px-12">
                <div className="container mx-auto max-w-4xl">
                    {receipt ? (
                        <ReceiptView receipt={receipt} />
                    ) : (
                        <>
                            <div className="mb-8 border-b-2 border-ink pb-4">
                                <p className="font-mono text-xs uppercase tracking-[0.25em] text-crate">
                                    Step 1 of 2
                                </p>
                                <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                                    Checkout
                                </h1>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                                <div className="space-y-6">
                                    {/* Shipping address */}
                                    <section className="rounded-lg border-2 border-ink bg-white p-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-crate" />
                                            <h2 className="font-display text-base font-semibold text-ink">
                                                Delivery address
                                            </h2>
                                        </div>
                                        <div className="space-y-3">
                                            <Field
                                                label="Street address"
                                                value={street}
                                                onChange={setStreet}
                                                placeholder="123 Rizal St."
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field
                                                    label="City"
                                                    value={city}
                                                    onChange={setCity}
                                                    placeholder="Davao City"
                                                />
                                                <Field
                                                    label="Province"
                                                    value={province}
                                                    onChange={setProvince}
                                                    placeholder="Davao del Sur"
                                                />
                                            </div>
                                            <Field
                                                label="Zip code"
                                                value={zipCode}
                                                onChange={setZipCode}
                                                placeholder="8000"
                                            />
                                        </div>
                                    </section>

                                    {/* Payment method */}
                                    <section className="rounded-lg border-2 border-ink bg-white p-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-crate" />
                                            <h2 className="font-display text-base font-semibold text-ink">
                                                Payment method
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            {paymentOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setPaymentMethod(
                                                            option.value,
                                                        )
                                                    }
                                                    className={`rounded-md border-2 p-3 text-left transition ${
                                                        paymentMethod ===
                                                        option.value
                                                            ? "border-ink bg-signal/20"
                                                            : "border-ink/20 hover:border-ink/40"
                                                    }`}
                                                >
                                                    <p className="font-display text-sm font-semibold text-ink">
                                                        {option.label}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-ink/60">
                                                        {option.description}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>

                                        {needsReference && (
                                            <div className="mt-5 rounded-md border-2 border-dashed border-ink/25 p-4">
                                                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50">
                                                    <QrCode className="h-3.5 w-3.5" />
                                                    Scan to pay
                                                </div>

                                                {activeQr ? (
                                                    <div className="mt-3 flex items-start gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQrModalOpen(
                                                                    true,
                                                                )
                                                            }
                                                            aria-label="View larger QR code"
                                                            className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-md border-2 border-ink"
                                                        >
                                                            <img
                                                                src={
                                                                    activeQr.imageUrl
                                                                }
                                                                alt={`${activeQr.type} QR code`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/50 group-hover:opacity-100">
                                                                <ZoomIn className="h-6 w-6 text-kraft" />
                                                            </span>
                                                        </button>
                                                        <div className="text-sm">
                                                            <p className="font-medium text-ink">
                                                                {
                                                                    activeQr.accountName
                                                                }
                                                            </p>
                                                            <p className="font-mono text-xs text-ink/60">
                                                                {
                                                                    activeQr.accountNumber
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="mt-3 text-sm text-ink/50">
                                                        QR code not available
                                                        right now — you can
                                                        still enter your
                                                        reference number once
                                                        you've sent payment
                                                        manually.
                                                    </p>
                                                )}

                                                <div className="mt-4">
                                                    <Field
                                                        label="Payment reference number"
                                                        value={paymentReference}
                                                        onChange={
                                                            setPaymentReference
                                                        }
                                                        placeholder="e.g. 0912345678901"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* Note */}
                                    <section className="rounded-lg border-2 border-ink bg-white p-5">
                                        <h2 className="font-display text-base font-semibold text-ink">
                                            Order note{" "}
                                            <span className="font-normal text-ink/40">
                                                (optional)
                                            </span>
                                        </h2>
                                        <textarea
                                            value={note}
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
                                            rows={3}
                                            placeholder="Delivery instructions, landmark, etc."
                                            className="mt-3 w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                                        />
                                    </section>
                                </div>

                                {/* Order summary */}
                                <div className="h-fit rounded-lg border-2 border-ink bg-white p-5 shadow-[4px_4px_0_0_theme(colors.crate)]">
                                    <p className="font-display text-base font-semibold text-ink">
                                        Order summary
                                    </p>
                                    <ul className="mt-4 space-y-2 border-t border-dashed border-ink/20 pt-4 font-mono text-xs text-ink/70">
                                        {items.map((item) => (
                                            <li
                                                key={item.productId}
                                                className="flex justify-between"
                                            >
                                                <span className="truncate pr-2">
                                                    {item.name} ×{" "}
                                                    {item.quantity}
                                                </span>
                                                <span className="shrink-0">
                                                    {formatPrice(
                                                        item.price *
                                                            item.quantity,
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 flex items-center justify-between border-t-2 border-ink pt-4">
                                        <span className="font-display text-sm font-semibold text-ink">
                                            Total
                                        </span>
                                        <span className="font-mono text-lg font-semibold text-crate">
                                            {formatPrice(totalPrice())}
                                        </span>
                                    </div>

                                    {error && (
                                        <p className="mt-4 rounded-md border border-route/40 bg-route/10 px-3 py-2 font-mono text-xs text-route">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="mt-5 w-full rounded-md bg-signal py-2.5 text-sm font-semibold text-ink transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading
                                            ? "Placing order..."
                                            : "Place order"}
                                    </button>

                                    <Link
                                        to="/cart"
                                        className="mt-3 block text-center font-mono text-xs text-ink/50 hover:text-ink"
                                    >
                                        ← Back to cart
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />

            {qrModalOpen && activeQr && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4"
                    onClick={() => setQrModalOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-xs rounded-lg border-2 border-ink bg-white p-5 shadow-[6px_6px_0_0_theme(colors.crate)]"
                    >
                        <button
                            type="button"
                            onClick={() => setQrModalOpen(false)}
                            aria-label="Close"
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-signal text-ink transition hover:bg-signal-dark"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <p className="text-center font-mono text-xs uppercase tracking-widest text-crate">
                            {activeQr.type}
                        </p>
                        <img
                            src={activeQr.imageUrl}
                            alt={`${activeQr.type} QR code, full size`}
                            className="mt-3 w-full rounded-md border-2 border-ink object-contain"
                        />
                        <p className="mt-3 text-center font-medium text-ink">
                            {activeQr.accountName}
                        </p>
                        <p className="text-center font-mono text-sm text-ink/60">
                            {activeQr.accountNumber}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
