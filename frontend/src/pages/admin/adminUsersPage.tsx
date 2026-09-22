import { useEffect, useState, type FormEvent } from "react";
import {
    UserPlus,
    ShieldCheck,
    Truck,
    ShoppingBag,
    Power,
    Loader2,
} from "lucide-react";
import api from "../../lib/axios";
import { formatShortDate } from "../../utils/formatters";
import type { User } from "../../types/user";

const ROLE_OPTIONS = [
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Delivery staff" },
] as const;

const ROLE_BADGE: Record<
    string,
    { label: string; icon: typeof ShieldCheck; className: string }
> = {
    manager: {
        label: "Manager",
        icon: ShieldCheck,
        className:
            "bg-[var(--color-crate-light)]/10 text-[var(--color-crate-light)]",
    },
    staff: {
        label: "Delivery staff",
        icon: Truck,
        className:
            "bg-[var(--color-signal)]/15 text-[var(--color-signal-dark)]",
    },
    customer: {
        label: "Customer",
        icon: ShoppingBag,
        className: "bg-[var(--color-ink)]/8 text-[var(--color-ink)]",
    },
};

const emptyForm = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "manager" as (typeof ROLE_OPTIONS)[number]["value"],
};

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const loadUsers = () => {
        setLoadError(null);
        api.get("/auth/users")
            .then(({ data }) => setUsers(data.users))
            .catch((err) =>
                setLoadError(getErrorMessage(err, "Couldn't load users.")),
            );
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const staffAndManagers = (users ?? []).filter(
        (u) => u.role === "manager" || u.role === "staff",
    );

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);
        setSubmitting(true);
        try {
            const { data } = await api.post("/auth/register-staff", form);
            setFormSuccess(
                `${data.user.fullName} was registered as ${ROLE_BADGE[data.user.role]?.label ?? data.user.role}.`,
            );
            setForm(emptyForm);
            loadUsers();
        } catch (err) {
            setFormError(
                getErrorMessage(err, "Couldn't register this account."),
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        setTogglingId(user._id);
        try {
            await api.patch(`/auth/toggle-status/${user._id}`);
            setUsers(
                (prev) =>
                    prev?.map((u) =>
                        u._id === user._id
                            ? { ...u, isActive: !u.isActive }
                            : u,
                    ) ?? prev,
            );
        } catch (err) {
            setLoadError(
                getErrorMessage(err, "Couldn't update that account's status."),
            );
        } finally {
            setTogglingId(null);
        }
    };

    const inputClass =
        "w-full rounded-md border-2 border-[var(--color-ink)]/20 bg-[var(--color-kraft)]/40 px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-crate-light)]";
    const labelClass =
        "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Users
                </h1>
                <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                    Register managers and delivery staff, and manage their
                    account status.
                </p>
            </div>

            {/* Register form */}
            <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-[var(--color-ink)]/10 bg-white p-5 shadow-sm"
            >
                <div className="mb-4 flex items-center gap-2">
                    <UserPlus
                        className="h-4 w-4 text-[var(--color-crate-light)]"
                        strokeWidth={1.75}
                    />
                    <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                        Register a new account
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>First name</label>
                        <input
                            required
                            className={inputClass}
                            value={form.firstName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    firstName: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Last name</label>
                        <input
                            required
                            className={inputClass}
                            value={form.lastName}
                            onChange={(e) =>
                                setForm({ ...form, lastName: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Username</label>
                        <input
                            required
                            className={inputClass}
                            value={form.username}
                            onChange={(e) =>
                                setForm({ ...form, username: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            required
                            type="email"
                            className={inputClass}
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone number</label>
                        <input
                            required
                            placeholder="09XXXXXXXXX"
                            className={inputClass}
                            value={form.phoneNumber}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    phoneNumber: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Role</label>
                        <select
                            className={inputClass}
                            value={form.role}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    role: e.target.value as typeof form.role,
                                })
                            }
                        >
                            {ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Temporary password</label>
                        <input
                            required
                            type="password"
                            className={inputClass}
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                        />
                        <p className="mt-1 text-xs text-[var(--color-ink)]/50">
                            At least 8 characters, including 3 numbers. The new
                            user gets this by email and can change it after
                            logging in.
                        </p>
                    </div>
                </div>

                {formError && (
                    <p className="mt-4 rounded-md border border-[var(--color-route)]/20 bg-[var(--color-route)]/5 px-3 py-2 text-sm text-[var(--color-route)]">
                        {formError}
                    </p>
                )}
                {formSuccess && (
                    <p className="mt-4 rounded-md border border-[var(--color-crate-light)]/20 bg-[var(--color-crate-light)]/5 px-3 py-2 text-sm text-[var(--color-crate-light)]">
                        {formSuccess}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 flex items-center gap-2 rounded-md bg-[var(--color-crate-light)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Register account
                </button>
            </form>

            {/* Users table */}
            <div className="overflow-hidden rounded-lg border border-[var(--color-ink)]/10 bg-white shadow-sm">
                <div className="border-b border-[var(--color-ink)]/10 px-5 py-4">
                    <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                        Managers &amp; staff
                    </h2>
                </div>

                {loadError && (
                    <p className="px-5 py-4 text-sm text-[var(--color-route)]">
                        {loadError}
                    </p>
                )}

                {!loadError && users === null && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-ink)]/30" />
                    </div>
                )}

                {!loadError &&
                    users !== null &&
                    staffAndManagers.length === 0 && (
                        <p className="px-5 py-6 text-sm text-[var(--color-ink)]/50">
                            No managers or staff yet. Register one above.
                        </p>
                    )}

                {staffAndManagers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-ink)]/10 text-xs uppercase tracking-wide text-[var(--color-ink)]/40">
                                    <th className="px-5 py-3 font-medium">
                                        Name
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Role
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Email
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Joined
                                    </th>
                                    <th className="px-5 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 font-medium text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffAndManagers.map((u) => {
                                    const badge = ROLE_BADGE[u.role];
                                    const Icon = badge?.icon ?? ShieldCheck;
                                    return (
                                        <tr
                                            key={u._id}
                                            className="border-b border-[var(--color-ink)]/5 last:border-0"
                                        >
                                            <td className="px-5 py-3 font-medium text-[var(--color-ink)]">
                                                {u.firstName} {u.lastName}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${badge?.className ?? ""}`}
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {badge?.label ?? u.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-[var(--color-ink)]/70">
                                                {u.email}
                                            </td>
                                            <td className="px-5 py-3 text-[var(--color-ink)]/50">
                                                {u.createdAt
                                                    ? formatShortDate(
                                                          u.createdAt,
                                                      )
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        u.isActive
                                                            ? "bg-[var(--color-crate-light)]/10 text-[var(--color-crate-light)]"
                                                            : "bg-[var(--color-route)]/10 text-[var(--color-route)]"
                                                    }`}
                                                >
                                                    {u.isActive
                                                        ? "Active"
                                                        : "Disabled"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() =>
                                                        handleToggleStatus(u)
                                                    }
                                                    disabled={
                                                        togglingId === u._id
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ink)]/15 px-2.5 py-1.5 text-xs font-medium text-[var(--color-ink)]/70 transition hover:bg-[var(--color-ink)]/5 disabled:opacity-50"
                                                >
                                                    {togglingId === u._id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Power className="h-3.5 w-3.5" />
                                                    )}
                                                    {u.isActive
                                                        ? "Disable"
                                                        : "Enable"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
