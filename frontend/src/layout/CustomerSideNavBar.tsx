import {
    useState,
    useContext,
    createContext,
    type Dispatch,
    type SetStateAction,
    type ReactNode,
} from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore.ts";
import api from "../lib/axios";
import { Avatar } from "../components/common/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGauge,
    faShoppingBag,
    faList,
    faAddressCard,
    faRightFromBracket,
    faCartShopping,
    faXmark,
    faPlus,
    faMinus,
    faTrash,
    faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

// ── Cart Context ──────────────────────────────────────────────────────────────
type CartItem = {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
    qty: number;
    stock?: number;
    category?: { name?: string } | null;
    [key: string]: any;
};

type CartContextType = {
    items: CartItem[];
    add: (product: CartItem) => void;
    update: (id: string, qty: number) => void;
    remove: (id: string) => void;
    clear: () => void;
    total: number;
    count: number;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [open, setOpen] = useState(false);

    const add = (product: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i._id === product._id);
            if (existing)
                return prev.map((i) =>
                    i._id === product._id ? { ...i, qty: i.qty + 1 } : i,
                );
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const remove = (id: string) =>
        setItems((prev) => prev.filter((i) => i._id !== id));

    const update = (id: string, qty: number) => {
        if (qty <= 0) {
            remove(id);
            return;
        }
        setItems((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
    };

    const clear = () => setItems([]);

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const count = items.reduce((s, i) => s + i.qty, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                add,
                remove,
                update,
                clear,
                total,
                count,
                open,
                setOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ── helpers ───────────────────────────────────────────────────────────────────
const peso = (n: number | null | undefined) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(n ?? 0);

// ── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
    const { items, remove, update, total, count, open, setOpen } = useCart();

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setOpen(false)}
                />
            )}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                            icon={faCartShopping}
                            className="text-green-700"
                        />
                        <p className="font-bold text-slate-800">My Cart</p>
                        {count > 0 && (
                            <span className="bg-green-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {count}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-slate-400"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="text-center py-20">
                            <FontAwesomeIcon
                                icon={faShoppingBag}
                                className="text-5xl text-gray-200 mb-3"
                            />
                            <p className="text-slate-400 text-sm">
                                Your cart is empty
                            </p>
                            <p className="text-slate-300 text-xs mt-1">
                                Add items to get started
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                            >
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                        <FontAwesomeIcon
                                            icon={faBoxOpen}
                                            className="text-gray-400"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-green-700 font-bold">
                                        {peso(item.price)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() =>
                                            update(item._id, item.qty - 1)
                                        }
                                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-100 transition"
                                    >
                                        <FontAwesomeIcon
                                            icon={faMinus}
                                            className="text-xs"
                                        />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold text-slate-700">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() =>
                                            update(item._id, item.qty + 1)
                                        }
                                        className="w-7 h-7 rounded-lg bg-green-700 flex items-center justify-center text-white hover:bg-green-800 transition"
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlus}
                                            className="text-xs"
                                        />
                                    </button>
                                </div>
                                <button
                                    onClick={() => remove(item._id)}
                                    className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition ml-1 flex-shrink-0"
                                >
                                    <FontAwesomeIcon
                                        icon={faTrash}
                                        className="text-xs"
                                    />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-sm">Subtotal</p>
                            <p className="font-bold text-slate-800 text-lg">
                                {peso(total)}
                            </p>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
                        >
                            <FontAwesomeIcon icon={faCartShopping} />
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

// ── Menu items ────────────────────────────────────────────────────────────────
const menuItems = [
    { label: "Dashboard", path: "/customer/home", icon: faGauge },
    { label: "Shop", path: "/customer/shop", icon: faShoppingBag },
    { label: "My Orders", path: "/customer/myOrders", icon: faList },
    { label: "Profile", path: "/customer/profile", icon: faAddressCard },
];

// ── Layout inner (consumes CartContext) ───────────────────────────────────────
function CustomerSideNavBarInner() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { count, setOpen } = useCart();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {}
        logout();
        navigate("/login");
    };

    return (
        <div className="h-screen bg-gray-100 flex overflow-hidden">
            {/* Mobile overlay */}
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
                                Customer Portal
                            </p>
                        </div>
                    </div>
                </div>

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

            {/* Main content */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-slate-600 hover:text-green-700"
                        >
                            ☰
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            {menuItems.find(
                                (item) => item.path === location.pathname,
                            )?.label || "Customer"}
                        </h1>
                    </div>

                    {/* Cart button */}
                    <button
                        onClick={() => setOpen(true)}
                        className="relative w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-700 hover:bg-green-100 transition"
                    >
                        <FontAwesomeIcon icon={faCartShopping} />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {count > 9 ? "9+" : count}
                            </span>
                        )}
                    </button>
                </header>

                <main className="flex-1 p-6">
                    {/* Pass setShowCheckout down so child pages can trigger checkout modal */}
                    <Outlet context={{ showCheckout, setShowCheckout }} />
                </main>
            </div>

            {/* Cart Drawer — opens checkout modal on proceed */}
            <CartDrawer
                onCheckout={() => {
                    setOpen(false);
                    setShowCheckout(true);
                }}
            />
        </div>
    );
}

export default function CustomerSideNavBar() {
    return (
        <CartProvider>
            <CustomerSideNavBarInner />
        </CartProvider>
    );
}
