import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { login } from "../../services/auth.service";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import type { ErrorResponse } from "../../types/api";

interface LoginFormData {
    username: string;
    password: string;
}

function Login() {
    const [formData, setFormData] = useState<LoginFormData>({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await login(formData);
            setUser(data.user);

            // redirect based on role
            if (data.user.role === "admin") navigate("/admin/dashboard");
            else if (data.user.role === "staff") navigate("/staff/orders");
            else navigate("/customer/home");
        } catch (err) {
            const error = err as AxiosError<ErrorResponse>;
            setError(
                error.response?.data?.message ||
                    "Login failed. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden">
                <div className="relative bg-green-700 w-full md:w-2/5 p-10 flex flex-col overflow-hidden">
                    <div className="absolute -top-16 -left-16 w-64 h-64 bg-green-600 rounded-full opacity-50" />
                    <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-green-800 rounded-full opacity-40" />

                    <div className="relative z-5 flex items-center gap-2">
                        <div className="bg-white rounded-full p-2">
                            <div className="w-6 h-6 bg-green-700 rounded-full" />
                        </div>
                        <span className="text-white font-bold text-lg">
                            BYM Order Pro
                        </span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1">
                        <h2 className="text-white text-3xl font-bold leading-tight">
                            Welcome Back!
                        </h2>
                        <p className="text-green-200 text-sm mt-3 leading-relaxed">
                            To stay connected with us, please login with your
                            personal info.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-3/5 p-10 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-800">
                            welcome
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Login to your account to continue
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Email/Username"
                                required
                                className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password..."
                                required
                                className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 placeholder-slate-400 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <div className="text-right">
                            <a
                                href="/forgot-password"
                                className="text-xs text-slate-400 hover:text-green-600"
                            >
                                Forgot your password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                        >
                            {loading ? "Signing in..." : "LOG IN"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        Don't have an account?{" "}
                        <a
                            href="/register"
                            className="text-green-600 font-medium hover:underline"
                        >
                            sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
