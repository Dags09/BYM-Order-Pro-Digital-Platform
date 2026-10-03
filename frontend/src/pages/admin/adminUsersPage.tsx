import { useEffect, useState } from "react";
import {
    UserPlus,
    ShieldCheck,
    Truck,
    ShoppingBag,
    Power,
    X,
} from "lucide-react";
import api from "../../lib/axios";
import { formatShortDate } from "../../utils/formatters";
import type { User } from "../../types/user";
import { Skeleton } from "../../components/skeletonLoader";
import { AdminUsersTableSkeleton } from "../../components/pageComponents/admin/adminPageSkeletons";
import AddStaffUserModal from "../../components/pageComponents/admin/addStaffUserModal";

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

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);

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

            {formSuccess && (
                <div
                    role="status"
                    className="flex items-start justify-between gap-3 rounded-md border border-crate-light/20 bg-crate-light/5 px-3 py-2 text-sm text-crate-light"
                >
                    <span>{formSuccess}</span>
                    <button
                        type="button"
                        onClick={() => setFormSuccess(null)}
                        aria-label="Dismiss success message"
                        className="shrink-0 rounded p-0.5 hover:bg-crate-light/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Users table */}
            <div className="overflow-hidden rounded-lg border border-[var(--color-ink)]/10 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--color-ink)]/10 px-5 py-4">
                    <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--color-ink)]">
                        Managers &amp; staff
                    </h2>
                    <button
                        type="button"
                        onClick={() => {
                            setFormSuccess(null);
                            setShowAddUser(true);
                        }}
                        className="flex shrink-0 items-center gap-1.5 rounded-md bg-crate px-3 py-1.5 text-xs font-medium text-white transition hover:bg-crate-dark sm:px-4 sm:py-2 sm:text-sm"
                    >
                        <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                        Add user
                    </button>
                </div>

                {loadError && (
                    <p className="px-5 py-4 text-sm text-[var(--color-route)]">
                        {loadError}
                    </p>
                )}

                {!loadError && users === null && (
                    <AdminUsersTableSkeleton />
                )}

                {!loadError &&
                    users !== null &&
                    staffAndManagers.length === 0 && (
                        <p className="px-5 py-6 text-sm text-[var(--color-ink)]/50">
                            No managers or staff yet. Add a user to get started.
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
                                                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
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

            {showAddUser && (
                <AddStaffUserModal
                    onClose={() => setShowAddUser(false)}
                    onCreated={(message) => {
                        setFormSuccess(message);
                        loadUsers();
                    }}
                />
            )}
        </div>
    );
}
