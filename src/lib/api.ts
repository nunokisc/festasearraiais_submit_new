// =============================================================
// festasearraiais_submit_new — lib/api.ts
// Thin client for the backoffice_api.
//
// Auxiliary-data endpoints (public, no auth):
//   GET /v1/public/districts
//   GET /v1/public/cities/by-district/:districtId
//   GET /v1/public/townships/by-city/:cityId
//   GET /v1/public/categories
//
// Submit endpoint (public, no auth):
//   POST /v1/submited/events/event   (multipart/form-data)
// =============================================================

import type {
  ApiResponse,
  Category,
  City,
  District,
  SubmitFormState,
  Township,
} from "./types";

// Server-only: never sent to the browser
const BACKOFFICE_API =
  process.env.BACKOFFICE_API_URL ??
  "https://backoffice-api.festasearraiais.pt";

// ─── Generic fetch helper ─────────────────────────────────────
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json: ApiResponse<T> = await res.json();
    if (json.status !== "ok") return null;
    return json.data;
  } catch {
    return null;
  }
}

// ─── Auxiliary data ──────────────────────────────────────────

export async function getDistricts(): Promise<District[]> {
  const data = await fetchJson<District[]>(
    `${BACKOFFICE_API}/v1/public/districts`
  );
  return data ?? [];
}

export async function getCitiesByDistrict(districtId: string | number): Promise<City[]> {
  if (!districtId) return [];
  // Calls the local Next.js proxy — backoffice URL stays server-side
  const data = await fetchJson<City[]>(`/api/cities/${districtId}`);
  return data ?? [];
}

export async function getTownshipsByCity(cityId: string | number): Promise<Township[]> {
  if (!cityId) return [];
  // Calls the local Next.js proxy — backoffice URL stays server-side
  const data = await fetchJson<Township[]>(`/api/townships/${cityId}`);
  return data ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchJson<Category[]>(
    `${BACKOFFICE_API}/v1/public/categories`
  );
  return data ?? [];
}

// ─── Submit event ─────────────────────────────────────────────

export interface SubmitResult {
  ok: boolean;
  message: string;
}

/**
 * Builds multipart FormData from the form state and POSTs it to
 * /v1/submited/events/event — mirroring the legacy PHP ACTION.
 *
 * Field names must exactly match the legacy PHP INSERT and the
 * backoffice_api validateEventCreation middleware.
 */
export async function submitEvent(form: SubmitFormState, recaptchaToken = ""): Promise<SubmitResult> {
  const fd = new FormData();

  // Required string fields
  fd.append("eventName", form.eventName.trim());
  fd.append("district", form.district);
  fd.append("city", form.city);
  fd.append("township", form.township);
  fd.append("place", form.place.trim());
  fd.append("category", form.category);
  fd.append("start_date", form.start_date);
  fd.append("end_date", form.end_date);
  fd.append("duration", form.duration);
  fd.append("lat", form.lat);
  fd.append("lon", form.lon);
  fd.append("description", form.description.trim());

  // Optional fields (only append if non-empty)
  if (form.price.trim()) fd.append("price", form.price.trim());
  if (form.website.trim()) fd.append("website", form.website.trim());
  if (form.email.trim()) fd.append("email", form.email.trim());
  if (form.contact.trim()) fd.append("contact", form.contact.trim());

  // Image — mutual exclusion enforced in validation
  if (form.image_up) {
    fd.append("image_up", form.image_up);
  } else if (form.image_url.trim()) {
    fd.append("image_url", form.image_url.trim());
  }

  // reCAPTCHA token — verified server-side in /api/submit
  if (recaptchaToken) {
    fd.append("g-recaptcha-response", recaptchaToken);
  }

  try {
    // POST to local Next.js API route which verifies recaptcha + proxies to backoffice_api
    const res = await fetch("/api/submit", {
      method: "POST",
      body: fd,
      // Do NOT set Content-Type — browser sets multipart boundary automatically
    });

    const json: ApiResponse<unknown> = await res.json();

    if (res.ok && json.status === "ok") {
      return { ok: true, message: json.msg || "Inserido com sucesso!" };
    }

    // API returned error JSON
    return {
      ok: false,
      message: json.msg || "Erro ao submeter o evento. Tenta novamente.",
    };
  } catch {
    return {
      ok: false,
      message: "Erro de ligação. Verifica a tua conexão e tenta novamente.",
    };
  }
}
