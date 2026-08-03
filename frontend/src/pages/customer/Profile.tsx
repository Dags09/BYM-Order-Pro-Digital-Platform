import { useState, type ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faLock,
    faLocationDot,
    faXmark,
    faSpinner,
    faPhone,
    faEnvelope,
    faIdCard,
    faFloppyDisk,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";
import useAuthStore from "../../store/authStore.ts";
import { InputField } from "../../components/customer/Profile/InputField.tsx";
import { SectionCard } from "../../components/customer/Profile/SelectionCard.tsx";
import { Toast } from "../../components/customer/Profile/Tost.tsx";
import {
    EyeBtn,
    type ShowPwField,
} from "../../components/customer/Profile/EyeBtn.tsx";

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Profile() {
    const { user, setUser } = useAuthStore();
    const [toast, setToast] = useState<{
        msg: string;
        type: "success" | "error";
    }>({ msg: "", type: "success" });
    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
    };

    // ── Personal Info ──────────────────────────────────────────────────────
    const [info, setInfo] = useState({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        username: user?.username ?? "",
        phoneNumber: user?.phoneNumber ?? "",
    });
    const [savingInfo, setSavingInfo] = useState(false);
    const [infoError, setInfoError] = useState("");

    const handleInfoChange = (e: ChangeEvent<HTMLInputElement>) =>
        setInfo((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleInfoSubmit = async () => {
        setInfoError("");
        setSavingInfo(true);
        try {
            const res = await api.put("/auth/update-profile", info);
            setUser(res.data.user);
            showToast("Profile updated successfully.");
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setInfoError(
                err.response?.data?.message ?? "Failed to update profile.",
            );
        } finally {
            setSavingInfo(false);
        }
    };

    // ── Change Password ────────────────────────────────────────────────────
    const [pw, setPw] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [savingPw, setSavingPw] = useState(false);
    const [pwError, setPwError] = useState("");

    const handlePwChange = (e: ChangeEvent<HTMLInputElement>) =>
        setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handlePwSubmit = async () => {
        setPwError("");
        if (pw.newPassword !== pw.confirmPassword) {
            setPwError("New passwords do not match.");
            return;
        }
        if (pw.newPassword.length < 8) {
            setPwError("Password must be at least 8 characters.");
            return;
        }
        setSavingPw(true);
        try {
            await api.post("/auth/change-password", {
                currentPassword: pw.currentPassword,
                newPassword: pw.newPassword,
            });
            setPw({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            showToast("Password changed successfully.");
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setPwError(
                err.response?.data?.message ?? "Failed to change password.",
            );
        } finally {
            setSavingPw(false);
        }
    };

    // ── Location ───────────────────────────────────────────────────────────

    const [loc, setLoc] = useState({
        address: user?.location?.address ?? "",
        city: user?.location?.city ?? "",
        province: user?.location?.province ?? "",
        zipCode: user?.location?.zipCode ?? "",
        country: user?.location?.country ?? "Philippines",
    });
    const [savingLoc, setSavingLoc] = useState(false);
    const [locError, setLocError] = useState("");
    const [locating, setLocating] = useState(false);
    const [locWarning, setLocWarning] = useState(false);

    const handleLocChange = (e: ChangeEvent<HTMLInputElement>) =>
        setLoc((p) => ({ ...p, [e.target.name]: e.target.value }));

    const detectLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                        { headers: { "Accept-Language": "en" } },
                    );
                    const data = await res.json();
                    const a = data.address;

                    console.log("Nominatim raw address:", a); // ← check this in DevTools

                    // Street address — PH roads are often in road, pedestrian, or neighbourhood
                    const street = [
                        a.house_number,
                        a.road ?? a.pedestrian ?? a.footway ?? a.path,
                        a.neighbourhood ?? a.suburb ?? a.village ?? a.hamlet,
                        a.barangay, // sometimes present in PH
                    ]
                        .filter(Boolean)
                        .join(", ");

                    // City — PH uses city, city_district, town, or municipality
                    const city =
                        a.city ??
                        a.city_district ??
                        a.town ??
                        a.municipality ??
                        a.county ??
                        "";

                    // Province — PH uses state, province, or region
                    const province =
                        a.province ??
                        a.state ??
                        a.state_district ??
                        a.region ??
                        "";

                    setLoc((prev) => ({
                        ...prev,
                        address: street,
                        city,
                        province,
                        zipCode: a.postcode ?? "",
                        country: a.country ?? "Philippines",
                    }));
                    setLocWarning(true);
                    showToast("Location detected — please verify the fields.");
                    setTimeout(() => setLocWarning(false), 6000);
                } catch {
                    showToast("Failed to get address from location.", "error");
                } finally {
                    setLocating(false);
                }
            },
            (err) => {
                setLocating(false);
                if (err.code === err.PERMISSION_DENIED) {
                    showToast("Location permission denied.", "error");
                } else {
                    showToast("Unable to detect location.", "error");
                }
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const handleLocSubmit = async () => {
        setLocWarning(false);
        setLocError("");
        if (!loc.address && !loc.city && !loc.province) {
            setLocError("Please fill in at least address, city, or province.");
            return;
        }
        setSavingLoc(true);
        try {
            const res = await api.patch("/auth/update-location", {
                location: loc,
            });
            if (user) {
                setUser({ ...user, location: res.data.location });
            }
            showToast("Delivery address updated.");
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } };
            setLocError(
                err.response?.data?.message ?? "Failed to update address.",
            );
        } finally {
            setSavingLoc(false);
        }
    };

    const [showPw, setShowPw] = useState<Record<ShowPwField, boolean>>({
        current: false,
        newPw: false,
        confirm: false,
    });

    const toggleShowPw = (field: ShowPwField) => {
        setShowPw((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    return (
        <>
            <Toast message={toast.msg} type={toast.type} />

            {locWarning && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
                    <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-start gap-3">
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">
                                Location may be inaccurate
                            </p>
                            <p className="text-xs mt-0.5 opacity-90">
                                Laptops and desktops don't have GPS — your
                                detected location may be off. Please review and
                                correct the fields before saving.
                            </p>
                        </div>
                        <button
                            onClick={() => setLocWarning(false)}
                            className="flex-shrink-0 hover:opacity-70 transition mt-0.5"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-5 max-w-2xl">
                {/* Page header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Profile
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        Manage your personal information and settings.
                    </p>
                </div>

                {/* Avatar + name banner */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <Avatar
                        name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                        color={user?.badgeColor}
                        isActive={Boolean(user?.isActive)}
                        className="w-16 h-16 rounded-2xl text-2xl flex-shrink-0"
                    />
                    <div>
                        <p className="text-xl font-bold text-slate-800">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-slate-400">
                            @{user?.username}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* ── Personal Info ── */}
                <SectionCard title="Personal Information" icon={faUser}>
                    {infoError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
                            {infoError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="First Name"
                            name="firstName"
                            value={info.firstName}
                            onChange={handleInfoChange}
                            placeholder="Juan"
                            icon={faIdCard}
                        />
                        <InputField
                            label="Last Name"
                            name="lastName"
                            value={info.lastName}
                            onChange={handleInfoChange}
                            placeholder="Dela Cruz"
                            icon={faIdCard}
                        />
                        <InputField
                            label="Username"
                            name="username"
                            value={info.username}
                            onChange={handleInfoChange}
                            placeholder="juandelacruz"
                            icon={faUser}
                        />
                        <InputField
                            label="Phone Number"
                            name="phoneNumber"
                            value={info.phoneNumber}
                            onChange={handleInfoChange}
                            placeholder="+639XXXXXXXXX"
                            icon={faPhone}
                        />
                        <div className="sm:col-span-2">
                            <InputField
                                label="Email"
                                name="email"
                                value={user?.email ?? ""}
                                onChange={() => {}}
                                icon={faEnvelope}
                                disabled
                            />
                            <p className="text-xs text-slate-300 mt-1">
                                Email cannot be changed.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleInfoSubmit}
                        disabled={savingInfo}
                        className="mt-5 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                    >
                        {savingInfo ? (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faFloppyDisk} />
                        )}
                        Save Changes
                    </button>
                </SectionCard>

                {/* ── Change Password ── */}
                <SectionCard title="Change Password" icon={faLock}>
                    {pwError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
                            {pwError}
                        </div>
                    )}
                    <div className="space-y-4">
                        <InputField
                            label="Current Password"
                            name="currentPassword"
                            value={pw.currentPassword}
                            onChange={handlePwChange}
                            type={showPw.current ? "text" : "password"}
                            placeholder="Enter current password"
                            icon={faLock}
                            rightSlot={
                                <EyeBtn
                                    field="current"
                                    visible={showPw.current}
                                    onToggle={toggleShowPw}
                                />
                            }
                        />
                        <InputField
                            label="New Password"
                            name="newPassword"
                            value={pw.newPassword}
                            onChange={handlePwChange}
                            type={showPw.newPw ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            icon={faLock}
                            rightSlot={
                                <EyeBtn
                                    field="newPw"
                                    visible={showPw.newPw}
                                    onToggle={toggleShowPw}
                                />
                            }
                        />
                        <InputField
                            label="Confirm New Password"
                            name="confirmPassword"
                            value={pw.confirmPassword}
                            onChange={handlePwChange}
                            type={showPw.confirm ? "text" : "password"}
                            placeholder="Re-enter new password"
                            icon={faLock}
                            disabled={!pw.newPassword}
                            rightSlot={
                                <EyeBtn
                                    field="confirm"
                                    visible={showPw.confirm}
                                    onToggle={toggleShowPw}
                                />
                            }
                        />
                    </div>

                    {/* Password strength */}
                    {pw.newPassword && (
                        <div className="mt-3 space-y-1">
                            {[
                                {
                                    label: "At least 8 characters",
                                    ok: pw.newPassword.length >= 8,
                                },
                                {
                                    label: "At least 3 numbers",
                                    ok:
                                        (pw.newPassword.match(/\d/g)?.length ??
                                            0) >= 3,
                                },
                                {
                                    label: "Passwords match",
                                    ok:
                                        pw.newPassword === pw.confirmPassword &&
                                        pw.confirmPassword !== "",
                                },
                            ].map((r) => (
                                <div
                                    key={r.label}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className={`text-xs ${r.ok ? "text-emerald-500" : "text-slate-300"}`}
                                    >
                                        {r.ok ? "✓" : "○"}
                                    </span>
                                    <span
                                        className={`text-xs ${r.ok ? "text-emerald-600" : "text-slate-400"}`}
                                    >
                                        {r.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handlePwSubmit}
                        disabled={
                            savingPw ||
                            !pw.currentPassword ||
                            !pw.newPassword ||
                            !pw.confirmPassword
                        }
                        className="mt-5 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                    >
                        {savingPw ? (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faLock} />
                        )}
                        Update Password
                    </button>
                </SectionCard>

                {/* ── Delivery Address ── */}
                <SectionCard title="Delivery Address" icon={faLocationDot}>
                    {locError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
                            {locError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <InputField
                                label="Street Address"
                                name="address"
                                value={loc.address}
                                onChange={handleLocChange}
                                placeholder="House no., Street, Barangay"
                                icon={faLocationDot}
                            />
                        </div>
                        <InputField
                            label="City / Municipality"
                            name="city"
                            value={loc.city}
                            onChange={handleLocChange}
                            placeholder="e.g. Quezon City"
                        />
                        <InputField
                            label="Province"
                            name="province"
                            value={loc.province}
                            onChange={handleLocChange}
                            placeholder="e.g. Metro Manila"
                        />
                        <InputField
                            label="ZIP Code"
                            name="zipCode"
                            value={loc.zipCode}
                            onChange={handleLocChange}
                            placeholder="e.g. 1100"
                        />
                        <InputField
                            label="Country"
                            name="country"
                            value={loc.country}
                            onChange={handleLocChange}
                            placeholder="Philippines"
                        />
                    </div>
                    <div className="mt-5 flex items-center gap-3">
                        <button
                            onClick={handleLocSubmit}
                            disabled={savingLoc}
                            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                        >
                            {savingLoc ? (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faFloppyDisk} />
                            )}
                            Save Address
                        </button>
                        <button
                            onClick={detectLocation}
                            disabled={locating}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition disabled:opacity-60"
                        >
                            {locating ? (
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faLocationDot} />
                            )}
                            {locating
                                ? "Detecting location…"
                                : "Use My Current Location"}
                        </button>
                    </div>
                </SectionCard>
            </div>
        </>
    );
}
