import { Link } from "react-router-dom";

interface SuccessMessageProps {
    email: string;
}

export default function SuccessMessage({ email }: SuccessMessageProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-kraft px-4 py-12">
            <div className="w-full max-w-sm rounded-lg border-2 border-ink bg-white p-7 text-center shadow-[5px_5px_0_0_var(colors.crate)]">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-crate">
                    Almost there
                </p>
                <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                    Check your email
                </h1>
                <p className="mt-2 text-sm text-ink/60">
                    We've sent a verification link to{" "}
                    <span className="font-medium text-ink">{email}</span>.
                    Verify your account, then log in to start ordering.
                </p>
                <Link
                    to="/Login"
                    className="mt-6 inline-block rounded-md bg-crate px-6 py-2.5 text-sm font-semibold text-kraft transition hover:bg-crate-dark"
                >
                    Go to log in
                </Link>
            </div>
        </main>
    );
}
