import { useState } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faEye,
    faEyeSlash,
    faSpinner,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../lib/axios";

interface StaffForm {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: "staff";
}

interface RegisterStaffModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function RegisterStaffModal({ onClose, onSuccess }: RegisterStaffModalProps) {
    const [form, setForm] = useState<StaffForm>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "staff",
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = <K extends keyof StaffForm>(k: K, v: StaffForm[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/register-staff", form);
            onSuccess();
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to register staff.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 m-0">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <p className="font-semibold text-slate-800">
                            Register New Staff
                        </p>
                        <p className="text-xs text-slate-400">
                            A verification email will be sent automatically.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                First Name
                            </label>
                            <input
                                required
                                value={form.firstName}
                                onChange={(e) =>
                                    set("firstName", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                                placeholder="Juan"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">
                                Last Name
                            </label>
                            <input
                                required
                                value={form.lastName}
                                onChange={(e) =>
                                    set("lastName", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                                placeholder="dela Cruz"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Username
                        </label>
                        <input
                            required
                            value={form.username}
                            onChange={(e) => set("username", e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                            placeholder="juandc"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Email
                        </label>
                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                            placeholder="juan@example.com"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Phone Number
                        </label>
                        <input
                            required
                            value={form.phoneNumber}
                            onChange={(e) => set("phoneNumber", e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                            placeholder="09XXXXXXXXX"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                required
                                type={showPass ? "text" : "password"}
                                value={form.password}
                                onChange={(e) =>
                                    set("password", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                                placeholder="Min 8 chars, 3 numbers"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <FontAwesomeIcon
                                    icon={showPass ? faEyeSlash : faEye}
                                />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Must be at least 8 characters with 3 numbers.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-700 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                            )}
                            {loading ? "Registering…" : "Register Staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export { RegisterStaffModal };
