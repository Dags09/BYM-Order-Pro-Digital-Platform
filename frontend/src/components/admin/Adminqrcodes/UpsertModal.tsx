import { useState } from "react";
import type { ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../../lib/axios";
import {
    faQrcode,
    faSpinner,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { QR_TYPES } from "../../../utils/constants";

interface QrType {
    id: string;
    label: string;
    color: string;
}

interface ExistingQr {
    accountName?: string;
    accountNumber?: string;
    imageUrl?: string;
}

interface UpsertModalProps {
    typeId: string;
    existing?: ExistingQr | null;
    onClose: () => void;
    onSaved: () => void;
}

interface FormState {
    accountName: string;
    accountNumber: string;
}

function UpsertModal({ typeId, existing, onClose, onSaved }: UpsertModalProps) {
    const cfg = QR_TYPES.find((t: QrType) => t.id === typeId);

    const [form, setForm] = useState<FormState>({
        accountName: existing?.accountName ?? "",
        accountNumber: existing?.accountNumber ?? "",
    });
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(
        existing?.imageUrl ?? null,
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!cfg) {
        // Guards against a bad/unknown typeId instead of crashing on cfg.color below
        return null;
    }

    const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!form.accountName || !form.accountNumber) {
            setError("Account name and number are required.");
            return;
        }
        if (!existing && !image) {
            setError("Please upload a QR code image.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const data = new FormData();
            data.append("type", typeId);
            data.append("accountName", form.accountName);
            data.append("accountNumber", form.accountNumber);
            if (image) data.append("image", image);
            await api.post("/qrcode/upsert", data);
            onSaved();
            onClose();
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center`}
                        >
                            <FontAwesomeIcon
                                icon={faQrcode}
                                className="text-white text-sm"
                            />
                        </div>
                        <p className="font-semibold text-slate-800">
                            {existing ? "Update" : "Upload"} {cfg.label} QR Code
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

                    {/* Image upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            QR Code Image{" "}
                            {!existing && (
                                <span className="text-red-400">*</span>
                            )}
                        </label>
                        {preview && (
                            <div className="mb-2 flex justify-center">
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="w-40 h-40 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {existing && (
                            <p className="text-xs text-slate-300 mt-1">
                                Leave empty to keep current image.
                            </p>
                        )}
                    </div>

                    {/* Account name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Account Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.accountName}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    accountName: e.target.value,
                                }))
                            }
                            placeholder="e.g. Juan Dela Cruz"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Account number */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Account Number / Phone{" "}
                            <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.accountNumber}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    accountNumber: e.target.value,
                                }))
                            }
                            placeholder="e.g. 09XXXXXXXXX"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {saving && (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                            )}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { UpsertModal };
