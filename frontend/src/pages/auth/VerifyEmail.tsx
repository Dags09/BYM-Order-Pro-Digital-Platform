import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/axios";

type VerifyStatus = "loading" | "success" | "error";

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [status, setStatus] = useState<VerifyStatus>("loading");
    const [countdown, setCountdown] = useState<number>(3);
    const hasVerified = useRef<boolean>(false); // add this

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                return;
            }

            if (hasVerified.current) return; // prevent double call
            hasVerified.current = true; // mark as called

            try {
                await api.get(`/auth/verify/${token}`);
                setStatus("success");
            } catch (err) {
                setStatus("error");
            }
        };
        verify();
    }, [token]);

    useEffect(() => {
        if (status === "success") {
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        navigate("/login");
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-green-700 rounded-full p-2">
                        <div className="w-5 h-5 bg-white rounded-full" />
                    </div>
                    <span className="text-green-700 font-bold text-xl">
                        BYM Order Pro
                    </span>
                </div>

                {/* Loading */}
                {status === "loading" && (
                    <div>
                        <div className="w-16 h-16 border-4 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-slate-800">
                            Verifying your email...
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            Please wait a moment.
                        </p>
                    </div>
                )}

                {/* Success */}
                {status === "success" && (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-green-600 text-3xl">✓</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Email Verified!
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            Your email has been verified successfully.
                        </p>
                        <p className="text-green-600 font-semibold mt-4">
                            Redirecting to login in {countdown}...
                        </p>
                    </div>
                )}

                {/* Error */}
                {status === "error" && (
                    <div>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-red-500 text-3xl">✗</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Verification Failed
                        </h2>
                        <p className="text-slate-400 text-sm mt-2">
                            The link is invalid or has expired. Please request a
                            new verification email.
                        </p>
                        <button
                            onClick={() => navigate("/resend-verification")}
                            className="mt-6 w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition duration-200"
                        >
                            Resend Verification Email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
