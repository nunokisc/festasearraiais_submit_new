"use client";

// =============================================================
// LocationSelects.tsx
// Cascaded district → city → township selects.
// Mirrors the jQuery cascade in legacy PHP index.php.
// =============================================================

import { FormField } from "./FormField";
import { useLocationCascade } from "@/hooks/useLocationCascade";
import type { District, FormErrors } from "@/lib/types";

interface LocationSelectsProps {
  districts: District[];
  districtValue: string;
  cityValue: string;
  townshipValue: string;
  errors: FormErrors;
  onChange: (field: "district" | "city" | "township", value: string) => void;
}

export function LocationSelects({
  districts,
  districtValue,
  cityValue,
  townshipValue,
  errors,
  onChange,
}: LocationSelectsProps) {
  const { cities, townships, loadingCities, loadingTownships, onDistrictChange, onCityChange } =
    useLocationCascade(
      (cityId) => onChange("city", cityId),
      (townshipId) => onChange("township", townshipId)
    );

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    onChange("district", val);
    onDistrictChange(val);
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    onCityChange(val);
  }

  function handleTownshipChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange("township", e.target.value);
  }

  const selectClass = (hasError: boolean) =>
    `field-input${hasError ? " error" : ""}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* District */}
      <FormField
        id="district"
        label="Distrito"
        required
        error={errors.district}
      >
        <select
          id="district"
          name="district"
          className={selectClass(!!errors.district)}
          value={districtValue}
          onChange={handleDistrictChange}
          aria-required="true"
          aria-describedby={errors.district ? "district-error" : undefined}
        >
          <option value="">Selecionar distrito</option>
          {districts.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.districtName}
            </option>
          ))}
        </select>
      </FormField>

      {/* City */}
      <FormField
        id="city"
        label="Concelho"
        required
        error={errors.city}
      >
        <div className="relative">
          <select
            id="city"
            name="city"
            className={selectClass(!!errors.city)}
            value={cityValue}
            onChange={handleCityChange}
            disabled={!districtValue || loadingCities}
            aria-required="true"
            aria-describedby={errors.city ? "city-error" : undefined}
          >
            <option value="">
              {loadingCities ? "A carregar…" : "Selecionar concelho"}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.cityName}
              </option>
            ))}
          </select>
          {loadingCities && (
            <span
              className="spinner absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          )}
        </div>
      </FormField>

      {/* Township / Freguesia */}
      <FormField
        id="township"
        label="Freguesia"
        required
        error={errors.township}
      >
        <div className="relative">
          <select
            id="township"
            name="township"
            className={selectClass(!!errors.township)}
            value={townshipValue}
            onChange={handleTownshipChange}
            disabled={!cityValue || loadingTownships}
            aria-required="true"
            aria-describedby={errors.township ? "township-error" : undefined}
          >
            <option value="">
              {loadingTownships ? "A carregar…" : "Selecionar freguesia"}
            </option>
            {townships.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.townshipName}
              </option>
            ))}
          </select>
          {loadingTownships && (
            <span
              className="spinner absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          )}
        </div>
      </FormField>
    </div>
  );
}
