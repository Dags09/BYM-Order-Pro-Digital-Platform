import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    Tags,
    Truck,
    Settings,
    Menu,
    X,
    LogOut,
    Warehouse,
} from "lucide-react";
import api from "../../../lib/axios";
import useAuthStore from "../../../store/authStore";

interface ManagerNavItem {
    name: string;
    path: string;
    icon: typeof LayoutDashboard;
    enabled: boolean;
}

// Mirrors the backend's manager-only routes:
// products (create/update/delete/stock), categories (create/update/delete),
// orders (view all + update status), drivers (assign).
const navItems: ManagerNavItem[] = [
    {
        name: "Dashboard",
        path: "/manager",
        icon: LayoutDashboard,
        enabled: true,
    },
    {
        name: "Orders",
        path: "/manager/orders",
        icon: ClipboardList,
        enabled: true,
    },
    {
        name: "Products",
        path: "/manager/products",
        icon: Package,
        enabled: true,
    },
    {
        name: "Categories",
        path: "/manager/categories",
        icon: Tags,
        enabled: true,
    },
    {
        name: "Drivers",
        path: "/manager/drivers",
        icon: Truck,
        enabled: true,
    },
];

export default function ManagerLayout() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            logout();
            navigate("/login");
        }
    };

    const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
        : "MG";

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
                        Manager console
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    if (!item.enabled) {
                        return (
                            <div
                                key={item.path}
                                className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2.5 text-sm text-white/30"
                                title="Coming soon"
                            >
                                <span className="flex items-center gap-3">
                                    <Icon
                                        className="h-4 w-4"
                                        strokeWidth={1.75}
                                    />
                                    {item.name}
                                </span>
                                <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/30">
                                    Soon
                                </span>
                            </div>
                        );
                    }
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/manager"}
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
                    to="/manager/settings"
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
                                : "Manager"}
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
                    BYM Order Pro Manager
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
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
