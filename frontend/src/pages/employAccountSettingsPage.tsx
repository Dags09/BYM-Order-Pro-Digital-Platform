import { useState, type FormEvent } from "react";
import { User as UserIcon, KeyRound, CheckCircle2 } from "lucide-react";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrator",
    manager: "Manager",
    staff: "Delivery staff",
    customer: "Your account",
};

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();

    // Profile form
    const [profileForm, setProfileForm] = useState({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        username: user?.username ?? "",
        phoneNumber: user?.phoneNumber ?? "",
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSaved, setProfileSaved] = useState(false);

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSaved, setPasswordSaved] = useState(false);

    const initials = user
        ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
        : "ST";

    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileError(null);
        setProfileSaved(false);
        try {
            const { data } = await api.put("/auth/update-profile", profileForm);
            setUser({
                ...user,
                ...data.user,
                _id: data.user.id ?? data.user._id ?? user?._id,
            });
            setProfileSaved(true);
        } catch (err) {
            setProfileError(
                getErrorMessage(err, "Couldn't update your profile."),
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSaved(false);

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            setPasswordError("New passwords don't match.");
            return;
        }

        setSavingPassword(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            setPasswordSaved(true);
        } catch (err) {
            setPasswordError(
                getErrorMessage(err, "Couldn't change your password."),
            );
        } finally {
            setSavingPassword(false);
        }
    };

    const inputClass =
        "w-full rounded-md border-2 border-ink/20 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition focus:border-crate";
    const labelClass = "mb-1.5 block text-sm font-medium text-ink";

    return (
        <div className="space-y-5">
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    Settings
                </h1>
                <p className="mt-1 text-sm text-ink/60">
                    Manage your profile and account security.
                </p>
            </div>

            {/* Identity */}
            <div className="flex items-center gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white"
                    style={{ backgroundColor: user?.badgeColor || "#2f6b4f" }}
                >
                    {initials || <UserIcon className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                    <p className="truncate font-display text-base font-semibold text-ink">
                        {user?.firstName} {user?.lastName}
                    </p>
                    <p className="truncate text-sm text-ink/50">
                        {user?.email}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-crate/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-crate">
                        {(user?.role && ROLE_LABELS[user.role]) ||
                            user?.role ||
                            "Account"}
                    </span>
                </div>
            </div>

            {/* Profile form */}
            <form
                onSubmit={handleProfileSubmit}
                className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
            >
                <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
                    Profile information
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>First name</label>
                        <input
                            type="text"
                            required
                            value={profileForm.firstName}
                            onChange={(e) =>
                                setProfileForm((f) => ({
                                    ...f,
                                    firstName: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Last name</label>
                        <input
                            type="text"
                            required
                            value={profileForm.lastName}
                            onChange={(e) =>
                                setProfileForm((f) => ({
                                    ...f,
                                    lastName: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Username</label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            value={profileForm.username}
                            onChange={(e) =>
                                setProfileForm((f) => ({
                                    ...f,
                                    username: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone number</label>
                        <input
                            type="tel"
                            required
                            value={profileForm.phoneNumber}
                            onChange={(e) =>
                                setProfileForm((f) => ({
                                    ...f,
                                    phoneNumber: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            disabled
                            value={user?.email ?? ""}
                            className={`${inputClass} cursor-not-allowed bg-kraft-dark/40 text-ink/50`}
                        />
                    </div>
                </div>

                {profileError && (
                    <p className="mt-4 rounded-md border border-route/20 bg-route/5 px-3 py-2 text-sm text-route">
                        {profileError}
                    </p>
                )}
                {profileSaved && (
                    <p className="mt-4 flex items-center gap-1.5 rounded-md border border-crate/20 bg-crate/5 px-3 py-2 text-sm text-crate">
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                        Profile updated.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={savingProfile}
                    className="mt-4 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-60"
                >
                    {savingProfile ? "Saving…" : "Save changes"}
                </button>
            </form>

            {/* Password form */}
            <form
                onSubmit={handlePasswordSubmit}
                className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
            >
                <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-ink/50">
                    <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Change password
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className={labelClass}>Current password</label>
                        <input
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                                setPasswordForm((f) => ({
                                    ...f,
                                    currentPassword: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>New password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                                setPasswordForm((f) => ({
                                    ...f,
                                    newPassword: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            Confirm new password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordForm.confirmNewPassword}
                            onChange={(e) =>
                                setPasswordForm((f) => ({
                                    ...f,
                                    confirmNewPassword: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>
                </div>

                {passwordError && (
                    <p className="mt-4 rounded-md border border-route/20 bg-route/5 px-3 py-2 text-sm text-route">
                        {passwordError}
                    </p>
                )}
                {passwordSaved && (
                    <p className="mt-4 flex items-center gap-1.5 rounded-md border border-crate/20 bg-crate/5 px-3 py-2 text-sm text-crate">
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                        Password changed.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={savingPassword}
                    className="mt-4 rounded-md bg-crate px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-crate-dark disabled:opacity-60"
                >
                    {savingPassword ? "Updating…" : "Update password"}
                </button>
            </form>
        </div>
    );
}
