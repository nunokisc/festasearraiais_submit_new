// =============================================================
// festasearraiais_submit_new — hooks/useLocationCascade.ts
// Manages the district → city → township cascade.
// Mirrors the jQuery AJAX cascade in the legacy PHP index.php.
// =============================================================
"use client";

import { useCallback, useEffect, useState } from "react";
import { getCitiesByDistrict, getTownshipsByCity } from "@/lib/api";
import type { City, Township } from "@/lib/types";

export interface LocationCascadeState {
  cities: City[];
  townships: Township[];
  loadingCities: boolean;
  loadingTownships: boolean;
}

export interface LocationCascadeActions {
  onDistrictChange: (districtId: string) => void;
  onCityChange: (cityId: string) => void;
}

export function useLocationCascade(
  onCitySet: (cityId: string) => void,
  onTownshipSet: (townshipId: string) => void
): LocationCascadeState & LocationCascadeActions {
  const [cities, setCities] = useState<City[]>([]);
  const [townships, setTownships] = useState<Township[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTownships, setLoadingTownships] = useState(false);

  const loadCities = useCallback(
    async (districtId: string) => {
      if (!districtId) {
        setCities([]);
        setTownships([]);
        onCitySet("");
        onTownshipSet("");
        return;
      }
      setLoadingCities(true);
      try {
        const data = await getCitiesByDistrict(districtId);
        setCities(data);
        // Auto-select first city and load its townships (mirrors PHP behaviour)
        if (data.length > 0) {
          const firstCityId = String(data[0].id);
          onCitySet(firstCityId);
          loadTownships(firstCityId);
        } else {
          onCitySet("");
          setTownships([]);
          onTownshipSet("");
        }
      } catch {
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const loadTownships = useCallback(
    async (cityId: string) => {
      if (!cityId) {
        setTownships([]);
        onTownshipSet("");
        return;
      }
      setLoadingTownships(true);
      try {
        const data = await getTownshipsByCity(cityId);
        setTownships(data);
        if (data.length > 0) {
          onTownshipSet(String(data[0].id));
        } else {
          onTownshipSet("");
        }
      } catch {
        setTownships([]);
      } finally {
        setLoadingTownships(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onDistrictChange = useCallback(
    (districtId: string) => {
      loadCities(districtId);
    },
    [loadCities]
  );

  const onCityChange = useCallback(
    (cityId: string) => {
      onCitySet(cityId);
      loadTownships(cityId);
    },
    [loadTownships, onCitySet]
  );

  return {
    cities,
    townships,
    loadingCities,
    loadingTownships,
    onDistrictChange,
    onCityChange,
  };
}
