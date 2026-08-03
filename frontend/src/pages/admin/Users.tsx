import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faUserPlus,
    faSearch,
    faToggleOn,
    faToggleOff,
    faUserTie,
    faUser,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import { fmt } from "../../utils/formatters";
import { RoleBadge } from "../../components/admin/Users/RoleBadge";
import { Avatar } from "../../components/common/Avatar";
import { Toast } from "../../components/customer/Profile/Tost";
import { RegisterStaffModal } from "../../components/admin/Users/RegistrationModal";
import type { UserRole } from "../../utils/constants";
import type { User } from "../../types/user";
import type { ToastType } from "../../types/ui";

interface ToastState {
    msg: string;
    type: ToastType;
}

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "inactive";

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [showModal, setShowModal] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = (msg: string, type: ToastType = "success") =>
        setToast({ msg, type });

    const fetchUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data.users ?? []);
        } catch {
            showToast("Failed to load users.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggle = async (user: User) => {
        setTogglingId(user._id);
        try {
            await api.patch(`/auth/toggle-status/${user._id}`);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === user._id ? { ...u, isActive: !u.isActive } : u,
                ),
            );
            showToast(
                `${user.firstName} ${user.isActive ? "disabled" : "enabled"} successfully.`,
            );
        } catch {
            showToast("Failed to update status.", "error");
        } finally {
            setTogglingId(null);
        }
    };

    const filtered = users.filter((u) => {
        const name =
            `${u.firstName} ${u.lastName} ${u.username} ${u.email}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const matchStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && u.isActive) ||
            (statusFilter === "inactive" && !u.isActive);
        return matchSearch && matchRole && matchStatus;
    });

    const counts = {
        total: users.length,
        staff: users.filter((u) => u.role === "staff").length,
        customers: users.filter((u) => u.role === "customer").length,
        inactive: users.filter((u) => !u.isActive).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading users…</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Users</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Manage staff and customer accounts.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-800 transition shadow-sm"
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Register Staff
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                {[
                    {
                        label: "Total Users",
                        value: counts.total,
                        icon: faUsers,
                        cls: "text-green-700 bg-blue-50",
                    },
                    {
                        label: "Staff",
                        value: counts.staff,
                        icon: faUserTie,
                        cls: "text-blue-700 bg-blue-50",
                    },
                    {
                        label: "Customers",
                        value: counts.customers,
                        icon: faUser,
                        cls: "text-slate-600 bg-blue-50",
                    },
                    {
                        label: "Inactive",
                        value: counts.inactive,
                        icon: faToggleOff,
                        cls: "text-red-500 bg-red-50",
                    },
                ].map((c) => (
                    <div
                        key={c.label}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
                    >
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.cls}`}
                        >
                            <FontAwesomeIcon
                                icon={c.icon}
                                className="text-lg"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                                {c.label}
                            </p>
                            <p className="text-2xl font-bold text-slate-800 leading-none">
                                {c.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-5 border-b border-gray-100">
                    <div className="relative flex-1 w-full">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, username or email…"
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "staff", "customer"] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                                    roleFilter === r
                                        ? "bg-green-700 text-white"
                                        : "bg-gray-100 text-slate-500 hover:bg-gray-200"
                                }`}
                            >
                                {r === "all" ? "All Users" : r}
                            </button>
                        ))}
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value as StatusFilter)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-slate-500 border-0 focus:outline-none focus:ring-2 focus:ring-green-200 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-slate-400 font-medium uppercase tracking-wide border-b border-gray-100">
                                <th className="text-left px-5 py-3">User</th>
                                <th className="text-left px-5 py-3 hidden md:table-cell">
                                    Contact
                                </th>
                                <th className="text-left px-5 py-3">Role</th>
                                <th className="text-left px-5 py-3 hidden lg:table-cell">
                                    Joined
                                </th>
                                <th className="text-left px-5 py-3 hidden lg:table-cell">
                                    Last Login
                                </th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-left px-5 py-3">
                                    Verified
                                </th>
                                <th className="text-center px-5 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="text-center py-12 text-slate-400 text-sm"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr
                                        key={u._id}
                                        className="hover:bg-gray-50/60 transition"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={`${u.firstName} ${u.lastName}`}
                                                    isActive={Boolean(
                                                        u.isActive,
                                                    )}
                                                    color={u.badgeColor}
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-700 truncate">
                                                        {u.firstName}{" "}
                                                        {u.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        @{u.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 hidden md:table-cell">
                                            <p className="text-slate-600 truncate max-w-[180px]">
                                                {u.email}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {u.phoneNumber || "—"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <RoleBadge role={u.role} />
                                        </td>
                                        <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                                            {fmt(u.createdAt)}
                                        </td>
                                        <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">
                                            {fmt(u.lastLogin)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                                                />
                                                {u.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                ${u.emailVerified ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${u.emailVerified ? "bg-blue-500" : "bg-yellow-500"}`}
                                                />
                                                {u.emailVerified
                                                    ? "Verified"
                                                    : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button
                                                onClick={() => handleToggle(u)}
                                                disabled={togglingId === u._id}
                                                title={
                                                    u.isActive
                                                        ? "Disable account"
                                                        : "Enable account"
                                                }
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition text-lg
                                                    ${u.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}
                                                    disabled:opacity-40`}
                                            >
                                                {togglingId === u._id ? (
                                                    <FontAwesomeIcon
                                                        icon={faSpinner}
                                                        className="animate-spin text-sm"
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        icon={
                                                            u.isActive
                                                                ? faToggleOn
                                                                : faToggleOff
                                                        }
                                                    />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                <div className="px-5 py-3 border-t border-gray-100">
                    <p className="text-xs text-slate-400">
                        Showing{" "}
                        <span className="font-medium text-slate-600">
                            {filtered.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-slate-600">
                            {users.length}
                        </span>{" "}
                        users
                    </p>
                </div>
            </div>

            {showModal && (
                <RegisterStaffModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        showToast(
                            "Staff registered successfully. Verification email sent.",
                        );
                        fetchUsers();
                    }}
                />
            )}

            {toast && (
                <Toast
                    msg={toast.msg}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
