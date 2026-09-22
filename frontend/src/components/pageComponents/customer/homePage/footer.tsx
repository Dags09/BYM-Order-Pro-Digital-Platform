import { Link, useNavigate } from "react-router-dom";
import { Package, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
    { name: "Home", path: "#home" },
    { name: "Products", path: "#products" },
    { name: "About Us", path: "#about" },
    { name: "Contact", path: "#contact" },
];

export default function Footer() {
    const navigate = useNavigate();

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
        <footer
            id="contact"
            className="border-t-2 border-ink bg-ink text-kraft"
        >
            <div className="container mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link
                            to="/home"
                            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-kraft"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded bg-signal text-ink">
                                <Package
                                    className="h-4.5 w-4.5"
                                    strokeWidth={2.5}
                                />
                            </span>
                            BYM
                        </Link>
                        <p className="mt-3 text-sm text-kraft/60">
                            Wholesale restocking for retailers. Order today,
                            delivered by tomorrow.
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-kraft/40">
                            Quick links
                        </p>
                        <ul className="mt-4 space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        onClick={(e) =>
                                            handleNavClick(e, link.path)
                                        }
                                        className="text-sm text-kraft/70 transition hover:text-signal"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-kraft/40">
                            Contact
                        </p>
                        <ul className="mt-4 space-y-3">
                            <li className="flex items-start gap-2 text-sm text-kraft/70">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                                Mabini, Davao Region, Philippines
                            </li>
                            <li className="flex items-center gap-2 text-sm text-kraft/70">
                                <Phone className="h-4 w-4 shrink-0 text-signal" />
                                +63 969 206 3429
                            </li>
                            <li className="flex items-center gap-2 text-sm text-kraft/70">
                                <Mail className="h-4 w-4 shrink-0 text-signal" />
                                jewellevincentatienza09@gmail.com
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-kraft/40">
                            We accept
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {["COD", "GCash", "Maya"].map((method) => (
                                <span
                                    key={method}
                                    className="rounded border border-kraft/25 px-3 py-1 font-mono text-xs text-kraft/70"
                                >
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-kraft/15 pt-6 sm:flex-row">
                    <p className="font-mono text-xs text-kraft/40">
                        © {new Date().getFullYear()} BYM. All rights reserved.
                    </p>
                    <p className="font-mono text-xs text-kraft/40">
                        Built for retailers, not shoppers.
                    </p>
                </div>
            </div>
        </footer>
    );
}
