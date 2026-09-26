import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    Truck,
    History,
    Settings,
    Menu,
    X,
    LogOut,
    Warehouse,
} from "lucide-react";
import useAuthStore from "../../../store/authStore";
import socket from "../../../lib/socket";

interface StaffNavItem {
    name: string;
    path: string;
    icon: typeof Truck;
}

const navItems: StaffNavItem[] = [
    { name: "My deliveries", path: "/staff", icon: Truck },
    { name: "History", path: "/staff/history", icon: History },
];

export default function StaffLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Join our personal socket room so we get "order:assigned" pushes
    useEffect(() => {
        if (!user?._id) return;
        socket.connect();
        socket.emit("join", user._id);
        return () => {
            socket.disconnect();
        };
    }, [user?._id]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
        : "ST";

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 px-5 py-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-crate-light)]">
                    <Warehouse className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div>
                    <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-white">
                        BYM Order Pro
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-white/50">
                        Delivery staff
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/staff"}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-[var(--color-crate-light)] text-white"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <Icon className="h-4 w-4" strokeWidth={1.75} />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 px-3 py-4">
                <NavLink
                    to="/staff/settings"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md px-2 py-2 transition-colors ${
                            isActive ? "bg-white/10" : "hover:bg-white/5"
                        }`
                    }
                >
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full font-[family-name:var(--font-mono)] text-xs font-semibold text-white"
                        style={{
                            backgroundColor: user?.badgeColor || "#f0b429",
                        }}
                    >
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                            {user
                                ? `${user.firstName} ${user.lastName}`
                                : "Staff"}
                        </p>
                        <p className="truncate text-xs text-white/50">
                            {user?.email}
                        </p>
                    </div>
                    <Settings
                        className="h-4 w-4 shrink-0 text-white/40"
                        strokeWidth={1.75}
                    />
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Log out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-kraft)]">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 hidden w-64 bg-[var(--color-ink)] lg:block">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-[var(--color-ink)]">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Mobile topbar */}
            <div className="flex items-center justify-between border-b border-black/5 bg-[var(--color-ink)] px-4 py-3 lg:hidden">
                <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-white">
                    BYM Order Pro Staff
                </span>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="text-white"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>
            {mobileOpen && (
                <button
                    onClick={() => setMobileOpen(false)}
                    className="fixed right-4 top-3 z-50 text-white lg:hidden"
                    aria-label="Close menu"
                >
                    <X className="h-5 w-5" />
                </button>
            )}

            <main className="lg:pl-64">
                <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
