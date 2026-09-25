import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff } from "lucide-react";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";

export default function Login() {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError("Please enter your username/email and password.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", {
                username,
                password,
            });

            setUser({
                _id: data.user.id,
                username: data.user.username,
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                role: data.user.role,
                badgeColor: data.user.badgeColor,
                location: data.user.location,
                phoneNumber: data.user.phoneNumber,
            });

            if (data.user.role === "admin") {
                navigate("/admin");
            } else if (data.user.role === "manager") {
                navigate("/manager");
            } else if (data.user.role === "customer") {
                navigate("/home");
            } else if (data.user.role === "staff") {
                navigate("/staff");
            } else {
                navigate("/home");
            }
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                "Something went wrong. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-kraft px-4 py-12">
            <div className="w-full max-w-sm">
                <Link
                    to="/home"
                    className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold tracking-tight text-ink"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-signal text-ink">
                        <Package className="h-4.5 w-4.5" strokeWidth={2.5} />
                    </span>
                    BYM
                </Link>

                <div className="rounded-lg border-2 border-ink bg-white p-7 shadow-[5px_5px_0_0_var(--color-crate)]">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-crate">
                        Retailer log in
                    </p>
                    <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-ink/60">
                        Log in to restock your store.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-1.5 block text-sm font-medium text-ink"
                            >
                                Username or email
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                                placeholder="juandelacruz"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-ink"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 pr-10 text-sm text-ink outline-none transition focus:border-crate"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="rounded-md border border-route/40 bg-route/10 px-3 py-2 font-mono text-xs text-route">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-crate py-2.5 text-sm font-semibold text-kraft shadow-[3px_3px_0_0_theme(colors.ink)] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_theme(colors.ink)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_0_theme(colors.ink)]"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-ink/60">
                        New here?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-crate hover:underline"
                        >
                            Register your store
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
