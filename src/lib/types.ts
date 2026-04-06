// =============================================================
// festasearraiais_submit_new — lib/types.ts
// Types for the event submission form and API responses.
// Fields mirror the legacy PHP festasearraiais_submit contract.
// =============================================================

// ─── API generic wrapper ─────────────────────────────────────
export interface ApiResponse<T> {
  status: "ok" | "nok";
  msg: string;
  data: T;
}

// ─── Auxiliary data ──────────────────────────────────────────
export interface District {
  id: number;
  districtName: string;
}

export interface City {
  id: number;
  cityName: string;
  district_id: number;
}

export interface Township {
  id: number;
  townshipName: string;
  city_id: number;
}

export interface Category {
  id: number;
  categoryName: string;
}

// ─── Form state ───────────────────────────────────────────────
/**
 * Mirrors field-for-field the legacy PHP form:
 *   index.php (fields) + insertEvent.php (INSERT columns).
 * Do NOT rename fields without a documented technical reason.
 */
export interface SubmitFormState {
  // Required — identification
  eventName: string;

  // Required — location (cascaded selects)
  district: string;    // district.id as string (select value)
  city: string;        // city.id as string
  township: string;    // township.id as string

  // Required — event details
  place: string;
  category: string;    // category.id as string
  start_date: string;  // YYYY-MM-DD
  end_date: string;    // YYYY-MM-DD
  duration: string;    // integer, days

  // Required — coordinates (set via map or manually)
  lat: string;
  lon: string;

  // Required — image (mutual exclusion: one of the two must be filled)
  image_url: string;
  image_up: File | null;

  // Optional
  price: string;
  website: string;
  email: string;
  contact: string;     // phone, max 9 digits
  description: string;
}

// ─── Validation errors ────────────────────────────────────────
export type FormErrors = Partial<Record<keyof SubmitFormState, string>>;

// ─── API submit payload ──────────────────────────────────────
/**
 * FormData built from SubmitFormState and sent as multipart/form-data
 * to POST /v1/submited/events/event.
 * Matches the validateEventCreation middleware in backoffice_api.
 */
export interface SubmitEventPayloadFields {
  eventName: string;
  district: string;
  city: string;
  township: string;
  place: string;
  category: string;
  start_date: string;
  end_date: string;
  duration: string;
  lat: string;
  lon: string;
  description: string;
  price?: string;
  website?: string;
  email?: string;
  contact?: string;
  image_url?: string;
  // image_up is appended as a File
}

// ─── Submission result ────────────────────────────────────────
export type SubmitStatus = "idle" | "submitting" | "success" | "error";
