import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { AxiosError } from "axios";
import type { ErrorResponse } from "../../types/api";

interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ResetPasswordFormData>({
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(3);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (formData.newPassword !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                token,
                newPassword: formData.newPassword,
            });
            setSuccess(true);

            // countdown redirect
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        navigate("/login");
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            setError(
                error.response?.data?.message ||
                    "Something went wrong. Please try again.",
            );
        } finally {
            setLoading(false);
        }
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

                {/* Success */}
                {success ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-green-600 text-3xl">✓</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Password Reset!
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            Your password has been reset successfully.
                        </p>
                        <p className="text-green-600 font-semibold mt-4">
                            Redirecting to login in {countdown}...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-800">
                                Reset Password
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Enter your new password below
                            </p>
                        </div>

                        {/* No token */}
                        {!token ? (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                                Invalid or missing reset token. Please request a
                                new reset link.
                            </div>
                        ) : (
                            <>
                                {/* Error */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    {/* New Password */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="Min. 8 characters with 3 numbers"
                                                required
                                                className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter your new password"
                                                required
                                                disabled={!formData.newPassword}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm transition duration-200
                                                    ${
                                                        !formData.newPassword
                                                            ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
                                                            : "bg-green-50 border-green-100"
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                disabled={!formData.newPassword}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs disabled:cursor-not-allowed"
                                            >
                                                {showConfirmPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                                    >
                                        {loading
                                            ? "Resetting..."
                                            : "Reset Password"}
                                    </button>
                                </form>
                            </>
                        )}
                    </>
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

export default ResetPassword;
