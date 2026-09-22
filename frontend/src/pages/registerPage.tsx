import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Package, Eye, EyeOff } from "lucide-react";
import api from "../lib/axios";
import SuccessMessage from "../components/pageComponents/registerPage/successMessage";
import { Field } from "../components/helper/field";
import StoreLocation from "../components/pageComponents/registerPage/storeLocation";

type FormFields = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
};

const backendFieldHints: [RegExp, keyof FormFields][] = [
    [/username/i, "username"],
    [/email/i, "email"],
    [/phone/i, "phoneNumber"],
    [/password/i, "password"],
];

export default function Register() {
    const [form, setForm] = useState<FormFields>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        address: "",
        city: "",
        province: "",
        zipCode: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<keyof FormFields, string>>
    >({});
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const update =
        (field: keyof FormFields) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setForm((f) => ({ ...f, [field]: e.target.value }));
            setFieldErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            });
        };

    const blockCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
    };

    const validate = (): Partial<Record<keyof FormFields, string>> => {
        const errors: Partial<Record<keyof FormFields, string>> = {};
        const {
            firstName,
            lastName,
            username,
            email,
            phoneNumber,
            password,
            confirmPassword,
            address,
            city,
            province,
            zipCode,
        } = form;

        if (!firstName) errors.firstName = "First name is required.";
        if (!lastName) errors.lastName = "Last name is required.";
        if (!username) errors.username = "Username is required.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = "Email is required.";
        } else if (!emailRegex.test(email)) {
            errors.email = "Enter a valid email address.";
        }

        const phoneRegex = /^(\+63|0)9\d{9}$/;
        if (!phoneNumber) {
            errors.phoneNumber = "Phone number is required.";
        } else if (!phoneRegex.test(phoneNumber)) {
            errors.phoneNumber =
                "Must be a valid Philippine number (e.g. 09XXXXXXXXX).";
        }

        if (!password) {
            errors.password = "Password is required.";
        } else if (password.length < 8) {
            errors.password = "Must be at least 8 characters.";
        } else if ((password.match(/\d/g)?.length ?? 0) < 3) {
            errors.password = "Must contain at least 3 numbers.";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password.";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        if (!address) errors.address = "Address is required.";
        if (!province) errors.province = "Select a province.";
        if (!city) errors.city = "Select a city.";
        if (!zipCode) errors.zipCode = "Zip code is required.";

        return errors;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});

        setLoading(true);
        try {
            await api.post("/auth/register-customer", {
                firstName: form.firstName,
                lastName: form.lastName,
                username: form.username,
                email: form.email,
                phoneNumber: form.phoneNumber,
                password: form.password,
                location: {
                    address: form.address,
                    city: form.city,
                    province: form.province,
                    zipCode: form.zipCode,
                    country: "Philippines",
                },
            });

            setSuccess(true);
        } catch (err: any) {
            const message: string =
                err?.response?.data?.message ||
                "Something went wrong. Please try again.";

            const matchedFields = backendFieldHints
                .filter(([pattern]) => pattern.test(message))
                .map(([, field]) => field);

            if (matchedFields.length > 0) {
                setFieldErrors(
                    Object.fromEntries(
                        matchedFields.map((field) => [field, message]),
                    ),
                );
                setFormError(null);
            } else {
                setFormError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return <SuccessMessage email={form.email} />;
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-kraft px-4 py-12">
            <div className="w-full max-w-lg">
                <Link
                    to="/home"
                    className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold tracking-tight text-ink"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-signal text-ink">
                        <Package className="h-4.5 w-4.5" strokeWidth={2.5} />
                    </span>
                    BYM
                </Link>

                <div className="rounded-lg border-2 border-ink bg-white p-7 shadow-[5px_5px_0_0_theme(colors.crate)]">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-crate">
                        Retailer sign up
                    </p>
                    <h1 className="mt-2 font-display text-2xl font-bold text-ink">
                        Register your store
                    </h1>
                    <p className="mt-1 text-sm text-ink/60">
                        Start ordering wholesale, delivered same-day.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-4"
                        noValidate
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <Field
                                label="First name"
                                value={form.firstName}
                                onChange={update("firstName")}
                                placeholder="Juan"
                                error={fieldErrors.firstName}
                            />
                            <Field
                                label="Last name"
                                value={form.lastName}
                                onChange={update("lastName")}
                                placeholder="Dela Cruz"
                                error={fieldErrors.lastName}
                            />
                        </div>

                        <Field
                            label="Username"
                            value={form.username}
                            onChange={update("username")}
                            placeholder="juandelacruz"
                            error={fieldErrors.username}
                        />

                        <Field
                            label="Email"
                            type="email"
                            value={form.email}
                            onChange={update("email")}
                            placeholder="juan@store.com"
                            error={fieldErrors.email}
                        />

                        <Field
                            label="Phone number"
                            value={form.phoneNumber}
                            onChange={update("phoneNumber")}
                            placeholder="09XXXXXXXXX"
                            error={fieldErrors.phoneNumber}
                        />

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-ink">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={update("password")}
                                    onCopy={blockCopy}
                                    className={`w-full rounded-md border-2 bg-kraft/40 px-3 py-2 pr-10 text-sm text-ink outline-none transition ${
                                        fieldErrors.password
                                            ? "border-route focus:border-route"
                                            : "border-ink/20 focus:border-crate"
                                    }`}
                                    placeholder="At least 8 characters, 3 numbers"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="mt-1 font-mono text-xs text-route">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        <Field
                            label="Confirm password"
                            type={showPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={update("confirmPassword")}
                            onCopy={blockCopy}
                            placeholder="Re-enter your password"
                            error={fieldErrors.confirmPassword}
                        />

                        <StoreLocation
                            form={form}
                            setForm={setForm}
                            update={update}
                            fieldErrors={fieldErrors}
                        />

                        {formError && (
                            <p className="rounded-md border border-route/40 bg-route/10 px-3 py-2 font-mono text-xs text-route">
                                {formError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-crate py-2.5 text-sm font-semibold text-kraft shadow-[3px_3px_0_0_theme(colors.ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_theme(colors.ink)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_0_theme(colors.ink)]"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-ink/60">
                        Already have an account?{" "}
                        <Link
                            to="/Login"
                            className="font-medium text-crate hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
