import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { philippineLocations } from "../../../data/philippineLocations";
import { Field } from "../../helper/field";

interface LocationFields {
    address: string;
    city: string;
    province: string;
    zipCode: string;
    [key: string]: string;
}

interface StoreLocationProps<T extends LocationFields> {
    form: T;
    setForm: Dispatch<SetStateAction<T>>;
    update: (
        field: keyof T,
    ) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    fieldErrors?: Record<string, string>;
}

export default function StoreLocation<T extends LocationFields>({
    form,
    setForm,
    update,
    fieldErrors = {},
}: StoreLocationProps<T>) {
    const sortedProvinces = [
        ...new Set(philippineLocations.map((entry) => entry.province)),
    ].sort((a, b) => a.localeCompare(b));

    const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setForm((f) => ({
            ...f,
            province: e.target.value,
            city: "",
        }));
    };

    const citiesInProvince = philippineLocations
        .filter((entry) => entry.province === form.province)
        .sort((a, b) => a.city.localeCompare(b.city));

    const selectClass = (hasError: boolean, disabled = false) =>
        `w-full rounded-md border-2 bg-kraft/40 px-3 py-2 text-sm text-ink outline-none transition ${
            hasError
                ? "border-route focus:border-route"
                : "border-ink/20 focus:border-crate"
        } ${disabled ? "cursor-not-allowed bg-kraft-dark/40 text-ink/50" : ""}`;

    return (
        <div className="border-t border-dashed border-ink/20 pt-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-ink/50">
                Store location
            </p>
            <div className="space-y-3">
                <Field
                    label="Address"
                    value={form.address}
                    onChange={update("address")}
                    placeholder="123 Rizal St."
                    error={fieldErrors.address}
                />

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">
                            Province
                        </label>
                        <select
                            value={form.province}
                            onChange={handleProvinceChange}
                            className={selectClass(!!fieldErrors.province)}
                        >
                            <option value="" disabled>
                                Select a province
                            </option>
                            {sortedProvinces.map((province) => (
                                <option key={province} value={province}>
                                    {province}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.province && (
                            <p className="mt-1 font-mono text-xs text-route">
                                {fieldErrors.province}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">
                            City
                        </label>
                        <select
                            value={form.city}
                            onChange={update("city")}
                            disabled={!form.province}
                            className={selectClass(
                                !!fieldErrors.city,
                                !form.province,
                            )}
                        >
                            <option value="" disabled>
                                {form.province
                                    ? "Select a city"
                                    : "Select a province first"}
                            </option>
                            {citiesInProvince.map((entry) => (
                                <option key={entry.city} value={entry.city}>
                                    {entry.city}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.city && (
                            <p className="mt-1 font-mono text-xs text-route">
                                {fieldErrors.city}
                            </p>
                        )}
                    </div>
                </div>

                <Field
                    label="Zip code"
                    value={form.zipCode}
                    onChange={update("zipCode")}
                    placeholder="8000"
                    error={fieldErrors.zipCode}
                />
            </div>
        </div>
    );
}
