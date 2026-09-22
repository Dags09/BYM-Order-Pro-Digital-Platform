import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    CalendarDays,
    ShieldCheck,
    Settings,
    Package,
} from "lucide-react";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore";
import NavBar from "../../components/pageComponents/customer/homePage/navBar";
import Footer from "../../components/pageComponents/customer/homePage/footer";

export default function ProfilePage() {
    const { user, isAuthenticated, setUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        api.get("/auth/me")
            .then(({ data }) => {
                const freshUser = data.user;
                setUser({
                    _id: freshUser.id ?? freshUser._id,
                    username: freshUser.username,
                    email: freshUser.email,
                    firstName: freshUser.firstName,
                    lastName: freshUser.lastName,
                    role: freshUser.role,
                    badgeColor: freshUser.badgeColor,
                    location: freshUser.location,
                    phoneNumber: freshUser.phoneNumber,
                    isActive: freshUser.isActive,
                    emailVerified: freshUser.emailVerified,
                    createdAt: freshUser.createdAt,
                    lastLogin: freshUser.lastLogin,
                });
            })
            .catch(() => {
                setError("Couldn't load your latest profile info.");
            })
            .finally(() => setLoading(false));
    }, [isAuthenticated, setUser]);

    if (!isAuthenticated) {
        return <Navigate to="/Login" replace />;
    }

    const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
        : "";

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-PH", {
              month: "long",
              year: "numeric",
          })
        : null;

    const hasAddress =
        user?.location &&
        (user.location.address || user.location.city || user.location.province);

    return (
        <div>
            <NavBar />

            <main className="min-h-[70vh] bg-kraft px-4 py-10 md:px-8 lg:px-12">
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-8 border-b-2 border-ink pb-4">
                        <p className="font-mono text-xs uppercase tracking-[0.25em] text-crate">
                            Account
                        </p>
                        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
                            My Profile
                        </h1>
                    </div>

                    {loading ? (
                        <p className="font-mono text-sm text-ink/50">
                            Loading your profile...
                        </p>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                            <div className="space-y-6">
                                {/* Identity card */}
                                <section className="rounded-lg border-2 border-ink bg-white p-6 shadow-[4px_4px_0_0_theme(colors.crate)]">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-ink font-display text-xl font-bold text-kraft"
                                            style={{
                                                backgroundColor:
                                                    user?.badgeColor ||
                                                    "#2f6b4f",
                                            }}
                                        >
                                            {initials || (
                                                <UserIcon className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-display text-lg font-bold text-ink">
                                                {user?.firstName}{" "}
                                                {user?.lastName}
                                            </p>
                                            <p className="font-mono text-xs text-ink/50">
                                                @{user?.username}
                                            </p>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                {user?.emailVerified && (
                                                    <span className="flex items-center gap-1 rounded border border-crate/40 bg-crate/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-crate">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="mt-4 rounded-md border border-route/40 bg-route/10 px-3 py-2 font-mono text-xs text-route">
                                            {error}
                                        </p>
                                    )}
                                </section>

                                {/* Contact info */}
                                <section className="rounded-lg border-2 border-ink bg-white p-6">
                                    <h2 className="font-display text-base font-semibold text-ink">
                                        Contact information
                                    </h2>
                                    <div className="mt-4 space-y-3">
                                        <InfoRow
                                            icon={Mail}
                                            label="Email"
                                            value={user?.email}
                                        />
                                        <InfoRow
                                            icon={Phone}
                                            label="Phone number"
                                            value={
                                                user?.phoneNumber || "Not set"
                                            }
                                        />
                                        <InfoRow
                                            icon={CalendarDays}
                                            label="Member since"
                                            value={memberSince || "—"}
                                        />
                                    </div>
                                </section>

                                {/* Address */}
                                <section className="rounded-lg border-2 border-ink bg-white p-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-crate" />
                                        <h2 className="font-display text-base font-semibold text-ink">
                                            Delivery address
                                        </h2>
                                    </div>

                                    {hasAddress ? (
                                        <p className="mt-3 text-sm text-ink/70">
                                            {user?.location?.address}
                                            {user?.location?.city &&
                                                `, ${user.location.city}`}
                                            {user?.location?.province &&
                                                `, ${user.location.province}`}
                                            {user?.location?.zipCode &&
                                                ` ${user.location.zipCode}`}
                                        </p>
                                    ) : (
                                        <p className="mt-3 text-sm text-ink/50">
                                            No address on file yet.
                                        </p>
                                    )}

                                    <Link
                                        to="/account/settings"
                                        className="mt-3 inline-block font-mono text-xs text-crate hover:underline"
                                    >
                                        {hasAddress
                                            ? "Edit address"
                                            : "Add address"}{" "}
                                        →
                                    </Link>
                                </section>
                            </div>

                            {/* Quick links */}
                            <div className="h-fit space-y-3">
                                <Link
                                    to="/account/settings"
                                    className="flex items-center gap-3 rounded-lg border-2 border-ink bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_theme(colors.crate)]"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-signal text-ink">
                                        <Settings className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="font-display text-sm font-semibold text-ink">
                                            Settings
                                        </p>
                                        <p className="font-mono text-[10px] text-ink/50">
                                            Edit profile & password
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    to="/account/ordersHistory"
                                    className="flex items-center gap-3 rounded-lg border-2 border-ink bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_theme(colors.crate)]"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-crate text-kraft">
                                        <Package className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="font-display text-sm font-semibold text-ink">
                                            Orders History
                                        </p>
                                        <p className="font-mono text-[10px] text-ink/50">
                                            Track past & current orders
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 shrink-0 text-ink/40" />
            <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
                    {label}
                </p>
                <p className="text-sm text-ink">{value}</p>
            </div>
        </div>
    );
}
