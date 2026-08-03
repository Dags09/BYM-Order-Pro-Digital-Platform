import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore.ts";
import api from "../lib/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "../components/common/Avatar";

import {
    faGauge,
    faUsers,
    faTag,
    faBox,
    faCartShopping,
    faComments,
    faRightFromBracket,
    faQrcode,
} from "@fortawesome/free-solid-svg-icons";

const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: faGauge },
    { label: "Users", path: "/admin/users", icon: faUsers },
    { label: "Categories", path: "/admin/categories", icon: faTag },
    { label: "Products", path: "/admin/products", icon: faBox },
    { label: "Orders", path: "/admin/orders", icon: faCartShopping },
    { label: "Feedbacks", path: "/admin/feedbacks", icon: faComments },
    { label: "QR Codes", path: "/admin/Adminqrcodes", icon: faQrcode },
];

function AdminSideNavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            logout();
            navigate("/login");
        } catch (err) {
            logout();
            navigate("/login");
        }
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                fixed top-0 left-0 h-screen w-64 bg-white text-slate-700 z-30
                flex flex-col border-r border-gray-200 shadow-sm
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0 md:static md:z-auto
            `}
            >
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-700 rounded-full p-2 flex-shrink-0">
                            <div className="w-5 h-5 bg-white rounded-full" />
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-tight">
                                BYM Order Pro
                            </p>
                            <p className="text-slate-400 text-xs">
                                Admin Panel
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200
                                ${
                                    location.pathname === item.path
                                        ? "bg-green-700 text-white font-semibold"
                                        : "text-slate-500 hover:bg-gray-100 hover:text-slate-800"
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={item.icon}
                                className="text-base"
                            />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User info + Logout */}
                <div className="p-4 border-t border-gray-300 mt-auto">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <Avatar
                            name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                            color={user?.badgeColor}
                            isActive={Boolean(user?.isActive)}
                            className="w-9 h-9 rounded-full text-sm flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                            <p className="text-black text-sm font-semibold truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-black hover:bg-green-700 transition duration-200 hover:text-white font-medium"
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Hamburger for mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-slate-600 hover:text-green-700"
                        >
                            ☰
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            {menuItems.find(
                                (item) => item.path === location.pathname,
                            )?.label || "Admin"}
                        </h1>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminSideNavBar;
