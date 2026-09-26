import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Truck,
    Mail,
    Phone,
    PackageCheck,
    ChevronRight,
} from "lucide-react";
import api from "../../lib/axios";
import { formatShortDate } from "../../utils/formatters";

interface Driver {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    activeDeliveries: number;
}

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function ManagerDriversPage() {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const loadDrivers = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get("/driver/list-drivers")
            .then(({ data }) => setDrivers(data))
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load drivers.")),
            )
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadDrivers();
    }, [loadDrivers]);

    const filtered = drivers.filter((d) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
            `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
            d.email.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-crate border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Drivers
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Delivery staff and who's currently on a run. New drivers are
                    added by an admin under Users.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {error}
                </div>
            )}

            <div className="relative">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30"
                    strokeWidth={1.75}
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search drivers"
                    className="w-full rounded-md border-2 border-ink/20 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-crate sm:w-72"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/20 bg-white/50 p-10 text-center">
                    <Truck
                        className="mx-auto h-8 w-8 text-ink/30"
                        strokeWidth={1.5}
                    />
                    <p className="mt-3 text-sm text-ink/60">
                        {drivers.length === 0
                            ? "No drivers yet. An admin can add one under Users."
                            : "No drivers match this search."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((driver) => (
                        <button
                            key={driver._id}
                            onClick={() =>
                                navigate(`/manager/drivers/${driver._id}`)
                            }
                            className="rounded-lg border border-ink/10 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-crate/30 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-medium text-ink">
                                        {driver.firstName} {driver.lastName}
                                    </p>
                                    <p className="text-xs text-ink/40">
                                        Driver since{" "}
                                        {formatShortDate(driver.createdAt)}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                        !driver.isActive
                                            ? "bg-route/10 text-route"
                                            : !driver.emailVerified
                                              ? "bg-signal/15 text-signal-dark"
                                              : "bg-crate/10 text-crate"
                                    }`}
                                >
                                    {!driver.isActive
                                        ? "Disabled"
                                        : !driver.emailVerified
                                          ? "Unverified"
                                          : "Active"}
                                </span>
                            </div>

                            {(!driver.isActive || !driver.emailVerified) && (
                                <p className="mt-1.5 text-xs text-ink/40">
                                    Not eligible for new order assignments.
                                </p>
                            )}

                            <div className="mt-3 space-y-1.5 text-sm text-ink/60">
                                <span className="flex items-center gap-2 truncate">
                                    <Mail
                                        className="h-3.5 w-3.5 shrink-0 text-ink/40"
                                        strokeWidth={1.75}
                                    />
                                    {driver.email}
                                </span>
                                {driver.phoneNumber && (
                                    <span className="flex items-center gap-2">
                                        <Phone
                                            className="h-3.5 w-3.5 shrink-0 text-ink/40"
                                            strokeWidth={1.75}
                                        />
                                        {driver.phoneNumber}
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink/10 pt-3">
                                <span className="flex items-center gap-2 text-sm text-ink/70">
                                    <PackageCheck
                                        className="h-4 w-4 text-ink/40"
                                        strokeWidth={1.75}
                                    />
                                    {driver.activeDeliveries === 0
                                        ? "No active deliveries"
                                        : `${driver.activeDeliveries} active ${driver.activeDeliveries === 1 ? "delivery" : "deliveries"}`}
                                </span>
                                <ChevronRight
                                    className="h-4 w-4 shrink-0 text-ink/30"
                                    strokeWidth={1.75}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
