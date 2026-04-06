"use client";

// =============================================================
// LocationSelects.tsx
// Cascaded district → city → township searchable selects.
// Mirrors the jQuery cascade in legacy PHP index.php.
// =============================================================

import { FormField } from "./FormField";
import { SearchableSelect } from "@/components/SearchableSelect";
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

  function handleDistrictChange(value: string) {
    onChange("district", value);
    onDistrictChange(value);
  }

  function handleCityChange(value: string) {
    onCityChange(value);
  }

  function handleTownshipChange(value: string) {
    onChange("township", value);
  }

  const districtOptions = districts.map((d) => ({
    value: String(d.id),
    label: d.districtName,
  }));

  const cityOptions = cities.map((c) => ({
    value: String(c.id),
    label: c.cityName,
  }));

  const townshipOptions = townships.map((t) => ({
    value: String(t.id),
    label: t.townshipName,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* District */}
      <FormField id="district" label="Distrito" required error={errors.district}>
        <SearchableSelect
          id="district"
          options={districtOptions}
          value={districtValue}
          onChange={handleDistrictChange}
          placeholder="Pesquisar distrito…"
          hasError={!!errors.district}
          aria-required={true}
          aria-describedby={errors.district ? "district-error" : undefined}
        />
      </FormField>

      {/* City */}
      <FormField id="city" label="Concelho" required error={errors.city}>
        <SearchableSelect
          id="city"
          options={cityOptions}
          value={cityValue}
          onChange={handleCityChange}
          placeholder="Pesquisar concelho…"
          disabled={!districtValue}
          loading={loadingCities}
          hasError={!!errors.city}
          aria-required={true}
          aria-describedby={errors.city ? "city-error" : undefined}
        />
      </FormField>

      {/* Township / Freguesia */}
      <FormField id="township" label="Freguesia" required error={errors.township}>
        <SearchableSelect
          id="township"
          options={townshipOptions}
          value={townshipValue}
          onChange={handleTownshipChange}
          placeholder="Pesquisar freguesia…"
          disabled={!cityValue}
          loading={loadingTownships}
          hasError={!!errors.township}
          aria-required={true}
          aria-describedby={errors.township ? "township-error" : undefined}
        />
      </FormField>
    </div>
  );
}
