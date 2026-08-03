import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { AxiosError } from "axios";
import type { ErrorResponse } from "../../types/api";

interface RegisterFormData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        setLoading(true);
        try {
            await api.post("/auth/register-customer", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                location: {
                    address: "",
                    city: "",
                    province: "",
                    zipCode: "",
                    country: "Philippines",
                },
            });
            navigate("/login?registered=true");
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            setError(
                error.response?.data?.message ||
                    "Registration failed. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 md:p-10">
                {/* Title */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="bg-green-700 rounded-full p-2">
                            <div className="w-5 h-5 bg-white rounded-full" />
                        </div>
                        <span className="text-green-700 font-bold text-xl">
                            BYM Order Pro
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Create Account
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Fill in the details below to get started
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Two column layout */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Box */}
                        <div className="w-full md:w-1/2 space-y-4">
                            {/* Name Row */}
                            <div className="flex gap-3">
                                <div className="w-1/2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Juan"
                                        required
                                        className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Dela Cruz"
                                        required
                                        className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="juandelacruz"
                                    required
                                    className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="juan@email.com"
                                    required
                                    className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                />
                            </div>
                        </div>

                        {/* Right Box */}
                        <div className="w-full md:w-1/2 space-y-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+639XXXXXXXXX"
                                    required
                                    className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 8 characters with 3 numbers"
                                        required
                                        className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
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
                                        placeholder="Re-enter your password"
                                        required
                                        disabled={!formData.password}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm transition duration-200
                                            ${
                                                !formData.password
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
                                        disabled={!formData.password}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs disabled:cursor-not-allowed"
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide mt-6"
                    >
                        {loading ? "Creating account..." : "REGISTER"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Already have an account?{" "}
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

export default Register;
