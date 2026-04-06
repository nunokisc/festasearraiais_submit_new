// =============================================================
// festasearraiais_submit_new — lib/validation.ts
// Frontend validation rules that mirror:
//   1. The legacy PHP insertEvent.php validatePosts()
//   2. The backoffice_api validateEventCreation middleware
//
// Fields and rules are derived strictly from both sources.
// =============================================================

import type { FormErrors, SubmitFormState } from "./types";

// ─── Regex patterns (from PHP index.php) ─────────────────────
const LAT_PATTERN = /^(\+|-)?(?:90(?:\.0{1,6})?|(?:[0-9]|[1-8][0-9])(?:\.[0-9]{1,6})?)$/;
const LON_PATTERN = /^(\+|-)?(?:180(?:\.0{1,6})?|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.[0-9]{1,6})?)$/;
const URL_PATTERN = /^https?:\/\/.+\..+/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateForm(form: SubmitFormState): FormErrors {
  const errors: FormErrors = {};

  // ── eventName ────────────────────────────────────────────
  if (!form.eventName.trim()) {
    errors.eventName = "Nome do evento é obrigatório.";
  } else if (form.eventName.trim().length < 3) {
    errors.eventName = "Nome do evento deve ter pelo menos 3 caracteres.";
  } else if (form.eventName.trim().length > 256) {
    errors.eventName = "Nome do evento não pode ter mais de 256 caracteres.";
  }

  // ── district ─────────────────────────────────────────────
  if (!form.district) {
    errors.district = "Seleciona um distrito.";
  }

  // ── city ─────────────────────────────────────────────────
  if (!form.city) {
    errors.city = "Seleciona um concelho.";
  }

  // ── township ─────────────────────────────────────────────
  if (!form.township) {
    errors.township = "Seleciona uma freguesia.";
  }

  // ── place ────────────────────────────────────────────────
  if (!form.place.trim()) {
    errors.place = "Local é obrigatório.";
  } else if (form.place.trim().length < 2) {
    errors.place = "Local deve ter pelo menos 2 caracteres.";
  } else if (form.place.trim().length > 128) {
    errors.place = "Local não pode ter mais de 128 caracteres.";
  }

  // ── category ─────────────────────────────────────────────
  if (!form.category) {
    errors.category = "Seleciona uma categoria.";
  }

  // ── start_date ───────────────────────────────────────────
  if (!form.start_date) {
    errors.start_date = "Data de início é obrigatória.";
  }

  // ── end_date ─────────────────────────────────────────────
  if (!form.end_date) {
    errors.end_date = "Data de fim é obrigatória.";
  } else if (form.start_date && form.end_date < form.start_date) {
    errors.end_date = "Data de fim não pode ser anterior à data de início.";
  }

  // ── duration ─────────────────────────────────────────────
  if (!form.duration) {
    errors.duration = "Duração é obrigatória.";
  } else {
    const d = parseInt(form.duration, 10);
    if (isNaN(d) || d < 1) {
      errors.duration = "Duração deve ser um número inteiro positivo.";
    }
  }

  // ── lat ──────────────────────────────────────────────────
  if (!form.lat.trim()) {
    errors.lat = "Latitude é obrigatória. Usa o mapa para preencher.";
  } else if (!LAT_PATTERN.test(form.lat.trim())) {
    errors.lat = "Latitude inválida. Exemplo: 39.159354";
  }

  // ── lon ──────────────────────────────────────────────────
  if (!form.lon.trim()) {
    errors.lon = "Longitude é obrigatória. Usa o mapa para preencher.";
  } else if (!LON_PATTERN.test(form.lon.trim())) {
    errors.lon = "Longitude inválida. Exemplo: -8.788921";
  }

  // ── image (mutual exclusion — one of the two is required)
  const hasUrl = !!form.image_url.trim();
  const hasFile = !!form.image_up;
  if (!hasUrl && !hasFile) {
    errors.image_url = "Insere a URL do cartaz ou faz upload de uma imagem.";
  }
  if (hasUrl && !URL_PATTERN.test(form.image_url.trim())) {
    errors.image_url = "URL da imagem inválida.";
  }
  if (hasFile && form.image_up) {
    const ext = form.image_up.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = ["jpg", "jpeg", "png", "webp"];
    if (!allowed.includes(ext)) {
      errors.image_up = "Apenas ficheiros JPG, JPEG, PNG ou WEBP são permitidos.";
    } else if (form.image_up.size > 3 * 1024 * 1024) {
      errors.image_up = "Imagem muito grande. Máximo 3 MB.";
    }
  }

  // ── description ──────────────────────────────────────────
  // API enforces min 10 chars (validateEventCreation) even though
  // the PHP form didn't mark it required client-side.
  if (!form.description.trim()) {
    errors.description = "Descrição é obrigatória.";
  } else if (form.description.trim().length < 10) {
    errors.description = "Descrição deve ter pelo menos 10 caracteres.";
  } else if (form.description.trim().length > 6192) {
    errors.description = "Descrição não pode ter mais de 6192 caracteres.";
  }

  // ── price (optional) ─────────────────────────────────────
  if (form.price.trim() && form.price.trim().length > 10) {
    errors.price = "Preço não pode ter mais de 10 caracteres.";
  }

  // ── website (optional) ───────────────────────────────────
  if (form.website.trim() && !URL_PATTERN.test(form.website.trim())) {
    errors.website = "URL do website inválida.";
  }

  // ── email (optional) ─────────────────────────────────────
  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Email inválido.";
  }

  // ── contact (optional) ───────────────────────────────────
  if (form.contact.trim()) {
    if (form.contact.trim().length > 9) {
      errors.contact = "Contacto não pode ter mais de 9 dígitos.";
    } else if (!/^\d+$/.test(form.contact.trim())) {
      errors.contact = "Contacto deve conter apenas dígitos.";
    }
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Calculates duration in days from start and end dates.
 * Mirrors the PHP form's `duration` field semantics.
 */
export function calcDuration(start: string, end: string): number {
  if (!start || !end) return 1;
  const diff =
    new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / 86_400_000) + 1);
}
