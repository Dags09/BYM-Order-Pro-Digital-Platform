import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Package, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../lib/axios";
import type { Status } from "../types/statusVerification";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");
    const [resendEmail, setResendEmail] = useState("");
    const [resendStatus, setResendStatus] = useState<
        "idle" | "sending" | "sent" | "error"
    >("idle");
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage("No verification token was provided.");
                return;
            }

            try {
                const { data } = await api.get(`/auth/verify/${token}`);
                setStatus("success");
                setMessage(
                    data.message ||
                        "Email verified successfully. You can now log in.",
                );
            } catch (err: any) {
                setStatus("error");
                setMessage(
                    err?.response?.data?.message ||
                        "Invalid or expired verification link.",
                );
            }
        };

        verify();
    }, [token]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail) return;

        setResendStatus("sending");
        setResendMessage(null);
        try {
            const { data } = await api.post("/auth/resend-verification-email", {
                email: resendEmail,
            });
            setResendStatus("sent");
            setResendMessage(
                data.message || "Verification email sent successfully.",
            );
        } catch (err: any) {
            setResendStatus("error");
            setResendMessage(
                err?.response?.data?.message ||
                    "Something went wrong. Please try again.",
            );
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

                <div className="rounded-lg border-2 border-ink bg-white p-7 text-center shadow-[5px_5px_0_0_theme(colors.crate)]">
                    {status === "verifying" && (
                        <>
                            <Loader2 className="mx-auto h-10 w-10 animate-spin text-crate" />
                            <h1 className="mt-4 font-display text-xl font-bold text-ink">
                                Verifying your email...
                            </h1>
                            <p className="mt-1 text-sm text-ink/60">
                                Hang tight, this only takes a moment.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle2 className="mx-auto h-10 w-10 text-crate" />
                            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-crate">
                                Verified
                            </p>
                            <h1 className="mt-1 font-display text-xl font-bold text-ink">
                                You're all set
                            </h1>
                            <p className="mt-2 text-sm text-ink/60">
                                {message}
                            </p>
                            <Link
                                to="/Login"
                                className="mt-6 inline-block rounded-md bg-crate px-6 py-2.5 text-sm font-semibold text-kraft transition hover:bg-crate-dark"
                            >
                                Go to log in
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <XCircle className="mx-auto h-10 w-10 text-route" />
                            <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-route">
                                Verification failed
                            </p>
                            <h1 className="mt-1 font-display text-xl font-bold text-ink">
                                Link didn't work
                            </h1>
                            <p className="mt-2 text-sm text-ink/60">
                                {message}
                            </p>

                            <div className="mt-6 border-t border-dashed border-ink/20 pt-5 text-left">
                                <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-ink/50">
                                    Resend verification email
                                </p>
                                <form
                                    onSubmit={handleResend}
                                    className="flex flex-col gap-2"
                                >
                                    <input
                                        type="email"
                                        value={resendEmail}
                                        onChange={(e) =>
                                            setResendEmail(e.target.value)
                                        }
                                        placeholder="you@store.com"
                                        className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate"
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            resendStatus === "sending" ||
                                            !resendEmail
                                        }
                                        className="rounded-md bg-signal py-2 text-sm font-semibold text-ink transition hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {resendStatus === "sending"
                                            ? "Sending..."
                                            : "Resend email"}
                                    </button>
                                </form>

                                {resendMessage && (
                                    <p
                                        className={`mt-2 text-center font-mono text-xs ${
                                            resendStatus === "sent"
                                                ? "text-crate"
                                                : "text-route"
                                        }`}
                                    >
                                        {resendMessage}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
