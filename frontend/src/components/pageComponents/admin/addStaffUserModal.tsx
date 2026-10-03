import { useEffect, useState, type FormEvent } from "react";
import { UserPlus, X } from "lucide-react";
import api from "../../../lib/axios";
import { Skeleton } from "../../skeletonLoader";

const ROLE_OPTIONS = [
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Delivery staff" },
] as const;

const emptyForm = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "manager" as (typeof ROLE_OPTIONS)[number]["value"],
};

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function AddStaffUserModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: (message: string) => void;
}) {
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !submitting) onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose, submitting]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const { data } = await api.post("/auth/register-staff", form);
            const roleLabel =
                ROLE_OPTIONS.find((option) => option.value === data.user.role)
                    ?.label ?? data.user.role;
            onCreated(`${data.user.fullName} was registered as ${roleLabel}.`);
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Couldn't register this account."));
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate-light";
    const labelClass = "mb-1.5 block text-sm font-medium text-ink";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !submitting
                ) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-user-title"
                className="w-full max-w-3xl overflow-hidden rounded-xl border border-ink/10 bg-white shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <UserPlus
                            className="h-4 w-4 text-crate-light"
                            strokeWidth={1.75}
                        />
                        <h2
                            id="add-user-title"
                            className="font-display text-sm font-semibold text-ink"
                        >
                            Register a new account
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close add user dialog"
                        className="rounded-md p-2 text-ink/50 transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass} htmlFor="staff-first">
                                First name
                            </label>
                            <input
                                id="staff-first"
                                required
                                autoFocus
                                className={inputClass}
                                value={form.firstName}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        firstName: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="staff-last">
                                Last name
                            </label>
                            <input
                                id="staff-last"
                                required
                                className={inputClass}
                                value={form.lastName}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        lastName: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label
                                className={labelClass}
                                htmlFor="staff-username"
                            >
                                Username
                            </label>
                            <input
                                id="staff-username"
                                required
                                className={inputClass}
                                value={form.username}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        username: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="staff-email">
                                Email
                            </label>
                            <input
                                id="staff-email"
                                required
                                type="email"
                                className={inputClass}
                                value={form.email}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        email: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label
                                className={labelClass}
                                htmlFor="staff-phone"
                            >
                                Phone number
                            </label>
                            <input
                                id="staff-phone"
                                required
                                placeholder="09XXXXXXXXX"
                                className={inputClass}
                                value={form.phoneNumber}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        phoneNumber: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="staff-role">
                                Role
                            </label>
                            <select
                                id="staff-role"
                                className={inputClass}
                                value={form.role}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        role: event.target
                                            .value as typeof form.role,
                                    })
                                }
                            >
                                {ROLE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-ink/60">
                                A secure password will be generated and sent to
                                the new user by email.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="mt-4 rounded-md border border-route/20 bg-route/5 px-3 py-2 text-sm text-route"
                        >
                            {error}
                        </p>
                    )}

                    <footer className="mt-5 flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-md bg-crate-light px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                            {submitting && (
                                <Skeleton className="h-4 w-4 rounded-full bg-white/50" />
                            )}
                            Register account
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
