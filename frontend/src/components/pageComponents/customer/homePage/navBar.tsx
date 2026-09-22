import { useState } from "react";
import type { NavLink as navLink } from "../../../../types/navLinks";
import { Link, useNavigate } from "react-router-dom";
import { Package, Menu, X } from "lucide-react";
import useAuthStore from "../../../../store/authStore";
import CartDropdown from "../cartPage/cartDropdown";

export default function navBar() {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const baseNavLinks: navLink[] = [
        { name: "Home", path: "#home" },
        { name: "Products", path: "#products" },
        { name: "About Us", path: "#about" },
        { name: "Contact", path: "#contact" },
    ];

    const navLinks: navLink[] = isAuthenticated
        ? [
              ...baseNavLinks,
              {
                  name: "Profile",
                  path: "/profile",
                  children: [
                      {
                          name: "Orders History",
                          path: "/account/ordersHistory",
                      },
                      { name: "Settings", path: "/account/settings" },
                  ],
              },
          ]
        : baseNavLinks;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        navigate("/home");
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleNavClick = (e: React.MouseEvent, path: string) => {
        if (!path.startsWith("#")) return;
        e.preventDefault();

        if (window.location.pathname === "/home") {
            const element = document.querySelector(path);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            navigate(`/home${path}`);
        }
    };

    return (
        <div className="sticky top-0 z-50">
            <nav className="border-b-2 border-ink bg-crate text-kraft">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <Link
                            to="/home"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-kraft"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded bg-signal text-ink">
                                <Package
                                    className="h-4.5 w-4.5"
                                    strokeWidth={2.5}
                                />
                            </span>
                            BYM
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-6 md:flex">
                            {navLinks.map((link) =>
                                link.children ? (
                                    <div
                                        key={link.path}
                                        className="group relative"
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={(e) =>
                                                handleNavClick(e, link.path)
                                            }
                                            className="relative flex items-center text-sm font-medium"
                                        >
                                            {link.name}
                                            <span
                                                className="pl-1"
                                                aria-hidden="true"
                                            >
                                                ▾
                                            </span>
                                            <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-center scale-x-0 bg-signal transition-transform duration-300 group-hover:scale-x-100" />
                                        </Link>

                                        <div className="invisible absolute right-0 z-10 mt-2 w-48 rounded-md border border-ink/10 bg-kraft text-ink opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className="block px-4 py-2 text-sm hover:bg-crate/10"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={(e) =>
                                            handleNavClick(e, link.path)
                                        }
                                        className="group relative text-sm font-medium"
                                    >
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-center scale-x-0 bg-signal transition-transform duration-300 group-hover:scale-x-100" />
                                    </Link>
                                ),
                            )}

                            <div className="ml-2 flex items-center gap-2">
                                {isAuthenticated ? (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="rounded border border-kraft/60 px-4 py-2 text-sm font-medium text-kraft transition hover:bg-kraft hover:text-crate"
                                    >
                                        Log Out
                                    </button>
                                ) : (
                                    <Link
                                        to="/Login"
                                        className="rounded border border-kraft/60 px-4 py-2 text-sm font-medium text-kraft transition hover:bg-kraft hover:text-crate"
                                    >
                                        Log In
                                    </Link>
                                )}

                                {isAuthenticated ? (
                                    <CartDropdown />
                                ) : (
                                    <Link
                                        to="/register"
                                        className="rounded bg-signal px-4 py-2 text-sm font-semibold text-ink transition hover:bg-signal-dark"
                                    >
                                        Register
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile controls: cart (if logged in) + hamburger */}
                        <div className="flex items-center gap-2 md:hidden">
                            {isAuthenticated && <CartDropdown />}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((v) => !v)}
                                aria-label={
                                    mobileMenuOpen ? "Close menu" : "Open menu"
                                }
                                aria-expanded={mobileMenuOpen}
                                className="rounded p-2 text-kraft transition hover:bg-kraft/10"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile dropdown panel */}
                {mobileMenuOpen && (
                    <div className="border-t border-kraft/20 bg-crate md:hidden">
                        <div className="space-y-1 px-4 py-3">
                            {navLinks.map((link) => (
                                <div key={link.path}>
                                    <Link
                                        to={link.path}
                                        onClick={(e) => {
                                            handleNavClick(e, link.path);
                                            closeMobileMenu();
                                        }}
                                        className="block rounded px-2 py-2 text-sm font-medium transition hover:bg-kraft/10"
                                    >
                                        {link.name}
                                    </Link>
                                    {link.children && (
                                        <div className="ml-3 space-y-1 border-l border-kraft/20 pl-3">
                                            {link.children.map((child) => (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    onClick={closeMobileMenu}
                                                    className="block rounded px-2 py-1.5 text-sm text-kraft/80 transition hover:bg-kraft/10"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="mt-3 flex flex-col gap-2 border-t border-kraft/20 pt-3">
                                {isAuthenticated ? (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="rounded border border-kraft/60 px-4 py-2 text-center text-sm font-medium text-kraft transition hover:bg-kraft hover:text-crate"
                                    >
                                        Log Out
                                    </button>
                                ) : (
                                    <>
                                        <Link
                                            to="/Login"
                                            onClick={closeMobileMenu}
                                            className="rounded border border-kraft/60 px-4 py-2 text-center text-sm font-medium text-kraft transition hover:bg-kraft hover:text-crate"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={closeMobileMenu}
                                            className="rounded bg-signal px-4 py-2 text-center text-sm font-semibold text-ink transition hover:bg-signal-dark"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
