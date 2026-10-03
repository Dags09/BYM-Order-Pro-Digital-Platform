import { useEffect, useRef, useState, type FormEvent } from "react";
import { QrCode, Upload, Power, ImageOff } from "lucide-react";
import api from "../../lib/axios";
import type { QRCodeEntry } from "../../types/qrcode";
import { Skeleton } from "../../components/skeletonLoader";
import { AdminQrCodesSkeleton } from "../../components/pageComponents/admin/adminPageSkeletons";

const QR_TYPES: { type: QRCodeEntry["type"]; label: string }[] = [
    { type: "gcash", label: "GCash" },
    { type: "maya", label: "Maya" },
];

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

interface QRCardProps {
    type: QRCodeEntry["type"];
    label: string;
    entry?: QRCodeEntry;
    onSaved: (entry: QRCodeEntry) => void;
    onToggled: (entry: QRCodeEntry) => void;
}

function QRCard({ type, label, entry, onSaved, onToggled }: QRCardProps) {
    const [editing, setEditing] = useState(false);
    const [accountName, setAccountName] = useState(entry?.accountName ?? "");
    const [accountNumber, setAccountNumber] = useState(
        entry?.accountNumber ?? "",
    );
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startEditing = () => {
        setAccountName(entry?.accountName ?? "");
        setAccountNumber(entry?.accountNumber ?? "");
        setFile(null);
        setPreview(null);
        setError(null);
        setEditing(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setPreview(selected ? URL.createObjectURL(selected) : null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!entry && !file) {
            setError("A QR code image is required.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("accountName", accountName);
            formData.append("accountNumber", accountNumber);
            if (file) formData.append("image", file);

            const { data } = await api.post("/qrcode/upsert", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onSaved(data.qrcode);
            setEditing(false);
        } catch (err) {
            setError(getErrorMessage(err, "Couldn't save this QR code."));
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        if (!entry) return;
        setToggling(true);
        setError(null);
        try {
            const { data } = await api.patch(`/qrcode/toggle/${entry._id}`);
            onToggled(data.qrcode);
        } catch (err) {
            setError(getErrorMessage(err, "Couldn't update this QR code."));
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-display text-base font-semibold text-ink">
                        {label}
                    </p>
                    {entry ? (
                        <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                entry.isActive
                                    ? "bg-crate/10 text-crate"
                                    : "bg-route/10 text-route"
                            }`}
                        >
                            {entry.isActive ? "Active" : "Disabled"}
                        </span>
                    ) : (
                        <span className="mt-1 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/50">
                            Not set up
                        </span>
                    )}
                </div>
                {entry && !editing && (
                    <button
                        onClick={handleToggle}
                        disabled={toggling}
                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                            entry.isActive
                                ? "border-ink/15 text-ink/60 hover:border-route/30 hover:text-route"
                                : "border-ink/15 text-ink/60 hover:border-crate/30 hover:text-crate"
                        }`}
                    >
                        {toggling ? (
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        ) : (
                            <Power className="h-3.5 w-3.5" />
                        )}
                        {entry.isActive ? "Disable" : "Enable"}
                    </button>
                )}
            </div>

            {!editing ? (
                <div className="mt-4">
                    {entry ? (
                        <div className="flex items-center gap-4">
                            <img
                                src={entry.imageUrl}
                                alt={`${label} QR code`}
                                className="h-24 w-24 rounded-md border border-ink/10 object-cover"
                            />
                            <div className="min-w-0 text-sm">
                                <p className="font-medium text-ink">
                                    {entry.accountName}
                                </p>
                                <p className="text-ink/50">
                                    {entry.accountNumber}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-ink/15 bg-kraft/40">
                            <ImageOff
                                className="h-6 w-6 text-ink/25"
                                strokeWidth={1.5}
                            />
                        </div>
                    )}
                    <button
                        onClick={startEditing}
                        className="mt-4 flex items-center gap-2 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark"
                    >
                        <Upload className="h-4 w-4" strokeWidth={1.75} />
                        {entry ? "Replace QR code" : "Upload QR code"}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-ink/20 bg-kraft/40 transition hover:border-crate"
                        >
                            {preview || entry?.imageUrl ? (
                                <img
                                    src={preview ?? entry?.imageUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Upload
                                    className="h-5 w-5 text-ink/30"
                                    strokeWidth={1.5}
                                />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-xs text-ink/50">
                            Click the square to choose a QR code image
                            {entry ? " (leave it to keep the current one)" : ""}
                            .
                        </p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">
                            Account name
                        </label>
                        <input
                            required
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">
                            Account number
                        </label>
                        <input
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                        />
                    </div>

                    {error && <p className="text-sm text-route">{error}</p>}

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-50"
                        >
                            {saving && (
                                <Skeleton className="h-4 w-4 rounded-full bg-white/50" />
                            )}
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {!editing && error && (
                <p className="mt-3 text-sm text-route">{error}</p>
            )}
        </div>
    );
}

export default function AdminQrCodesPage() {
    const [qrcodes, setQrcodes] = useState<QRCodeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get("/qrcode/admin/all")
            .then(({ data }) => setQrcodes(data.qrcodes))
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load QR codes.")),
            )
            .finally(() => setLoading(false));
    }, []);

    const upsertLocal = (entry: QRCodeEntry) => {
        setQrcodes((prev) => {
            const exists = prev.some((q) => q._id === entry._id);
            return exists
                ? prev.map((q) => (q._id === entry._id ? entry : q))
                : [...prev, entry];
        });
    };

    if (loading) {
        return <AdminQrCodesSkeleton />;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink">
                    <QrCode className="h-6 w-6 text-crate" strokeWidth={1.75} />
                    QR Codes
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    The GCash and Maya QR codes customers see at checkout for
                    digital payments.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {QR_TYPES.map(({ type, label }) => (
                    <QRCard
                        key={type}
                        type={type}
                        label={label}
                        entry={qrcodes.find((q) => q.type === type)}
                        onSaved={upsertLocal}
                        onToggled={upsertLocal}
                    />
                ))}
            </div>
        </div>
    );
}
