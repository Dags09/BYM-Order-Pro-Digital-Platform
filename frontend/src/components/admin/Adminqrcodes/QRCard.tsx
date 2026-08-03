import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faQrcode,
    faUpload,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { QR_TYPES } from "../../../utils/constants";

type QRType = (typeof QR_TYPES)[number];

type QRData = {
    _id: string;
    type: string;
    isActive: boolean;
    imageUrl: string;
    accountName: string;
    accountNumber: string;
};

type QRCardProps = {
    qrcode?: QRData;
    type: QRType;
    onEdit: (id: string) => void;
};

function QRCard({ qrcode, type, onEdit }: QRCardProps) {
    const cfg = QR_TYPES.find((t) => t.id === type.id);
    if (!cfg) return null;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center`}
                    >
                        <FontAwesomeIcon
                            icon={faQrcode}
                            className="text-white"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">
                            {cfg.label}
                        </p>
                        {qrcode && (
                            <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${qrcode.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                            >
                                {qrcode.isActive ? "Active" : "Inactive"}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => onEdit(type.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition"
                >
                    <FontAwesomeIcon icon={qrcode ? faPenToSquare : faUpload} />
                    {qrcode ? "Update" : "Upload"}
                </button>
            </div>

            {qrcode ? (
                <div className="flex items-start gap-4">
                    <img
                        src={qrcode.imageUrl}
                        alt={`${cfg.label} QR`}
                        className="w-32 h-32 object-contain rounded-xl border border-gray-100 bg-gray-50 p-1 flex-shrink-0"
                    />
                    <div className="space-y-1.5 min-w-0">
                        <div>
                            <p className="text-xs text-slate-400">
                                Account Name
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                                {qrcode.accountName}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">
                                Account Number
                            </p>
                            <p className="text-sm font-mono text-slate-700">
                                {qrcode.accountNumber}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={`${cfg.light} rounded-xl p-6 text-center border border-dashed border-gray-200`}
                >
                    <FontAwesomeIcon
                        icon={faQrcode}
                        className={`text-3xl ${cfg.text} mb-2 opacity-40`}
                    />
                    <p className="text-sm text-slate-400">
                        No QR code uploaded yet
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                        Click Update to add one
                    </p>
                </div>
            )}
        </div>
    );
}

export { QRCard };
