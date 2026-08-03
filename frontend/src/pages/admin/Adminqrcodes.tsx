import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faToggleOn,
    faToggleOff,
    faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { QR_TYPES } from "../../utils/constants";
import { QRCard } from "../../components/admin/Adminqrcodes/QRCard";
import { UpsertModal } from "../../components/admin/Adminqrcodes/UpsertModal";

interface QrCodeEntry {
    _id: string;
    type: string;
    accountName: string;
    accountNumber: string;
    imageUrl: string;
    isActive: boolean;
}

export default function AdminQRCodes() {
    const [qrcodes, setQrcodes] = useState<QrCodeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null); // typeId being edited
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const fetchQR = async () => {
        try {
            const res = await api.get("/qrcode");
            setQrcodes(res.data.qrcodes ?? []);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQR();
    }, []);

    const handleToggle = async (id: string) => {
        try {
            await api.patch(`/qrcode/toggle/${id}`);
            await fetchQR();
            showToast("Status updated.");
        } catch {}
    };

    const handleSaved = async () => {
        await fetchQR();
        showToast("QR code saved successfully.");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {toast}
                </div>
            )}

            <div className="space-y-5 max-w-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Payment QR Codes
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Manage GCash and Maya QR codes shown to customers during
                        checkout.
                    </p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">
                        How it works
                    </p>
                    <ul className="text-xs text-amber-600 space-y-1">
                        <li>• Upload your GCash or Maya QR code image here</li>
                        <li>
                            • Customers will see it when selecting digital
                            payment at checkout
                        </li>
                        <li>
                            • Customers scan and pay, then enter their reference
                            number
                        </li>
                        <li>
                            • You can see the reference number on each order
                        </li>
                        <li>
                            • Deactivate a QR code to hide it from customers
                            temporarily
                        </li>
                    </ul>
                </div>

                <div className="space-y-4">
                    {QR_TYPES.map((type) => {
                        const qrcode = qrcodes.find((q) => q.type === type.id);
                        return (
                            <div key={type.id}>
                                <QRCard
                                    qrcode={qrcode}
                                    type={type}
                                    onEdit={setEditing}
                                />
                                {qrcode && (
                                    <div className="mt-2 flex justify-end flex-row">
                                        <button
                                            onClick={() =>
                                                handleToggle(qrcode._id)
                                            }
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition
                                                ${
                                                    qrcode.isActive
                                                        ? "bg-red-50 text-red-500 hover:bg-red-100"
                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                }`}
                                        >
                                            <FontAwesomeIcon
                                                icon={
                                                    qrcode.isActive
                                                        ? faToggleOff
                                                        : faToggleOn
                                                }
                                            />
                                            {qrcode.isActive
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {editing && (
                <UpsertModal
                    typeId={editing}
                    existing={qrcodes.find((q) => q.type === editing)}
                    onClose={() => setEditing(null)}
                    onSaved={handleSaved}
                />
            )}
        </>
    );
}
