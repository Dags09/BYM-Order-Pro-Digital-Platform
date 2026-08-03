import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "../../lib/axios";
import { AxiosError } from "axios";
import type { ErrorResponse } from "../../types/api";

type Status = "success" | "error" | null;

function ForgotPassword() {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<Status>(null);
    const [message, setMessage] = useState<string>("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await api.post("/auth/request-forgot-password", {
                email,
            });
            setStatus("success");
            setMessage(response.data.message);
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            setStatus("error");
            setMessage(
                error.response?.data?.message ||
                    "Something went wrong. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-green-700 rounded-full p-2">
                        <div className="w-5 h-5 bg-white rounded-full" />
                    </div>
                    <span className="text-green-700 font-bold text-xl">
                        BYM Order Pro
                    </span>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Forgot Password
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {/* Success */}
                {status === "success" && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg mb-6 text-sm text-center">
                        <p className="font-semibold mb-1">
                            📧 Check your email!
                        </p>
                        <p>{message}</p>
                    </div>
                )}

                {/* Error */}
                {status === "error" && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {message}
                    </div>
                )}

                {/* Form — hide after success */}
                {status !== "success" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="juan@email.com"
                                required
                                className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className="text-center text-xs text-slate-400 mt-6">
                    Remember your password?{" "}
                    <a
                        href="/login"
                        className="text-green-600 font-medium hover:underline"
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
