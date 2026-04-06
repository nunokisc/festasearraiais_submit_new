"use client";

// =============================================================
// SubmitForm.tsx
// Public event submission form.
//
// Fields contract:  festasearraiais_submit/index.php (source of truth)
// API target:       POST /v1/submited/events/event (backoffice_api)
// Validation rules: insertEvent.php + validateEventCreation middleware
//
// All field names are preserved exactly from the legacy PHP form.
// =============================================================

import { useState } from "react";
import { SectionCard } from "./SectionCard";
import { FormField } from "./FormField";
import { LocationSelects } from "./LocationSelects";
import { ImageInput } from "./ImageInput";
import { MapModal } from "./MapModal";
import { submitEvent } from "@/lib/api";
import { validateForm, hasErrors, calcDuration } from "@/lib/validation";
import type { Category, District, FormErrors, SubmitFormState, SubmitStatus } from "@/lib/types";

const EMPTY_FORM: SubmitFormState = {
  eventName: "",
  district: "",
  city: "",
  township: "",
  place: "",
  category: "",
  start_date: "",
  end_date: "",
  duration: "",
  lat: "",
  lon: "",
  image_url: "",
  image_up: null,
  price: "",
  website: "",
  email: "",
  contact: "",
  description: "",
};

interface SubmitFormProps {
  districts: District[];
  categories: Category[];
}

export function SubmitForm({ districts, categories }: SubmitFormProps) {
  const [form, setForm] = useState<SubmitFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof SubmitFormState, boolean>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [apiMessage, setApiMessage] = useState("");
  const [mapOpen, setMapOpen] = useState(false);

  // ─── Generic field change ────────────────────────────────
  function setField<K extends keyof SubmitFormState>(key: K, value: SubmitFormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-calculate duration when dates change
      if (key === "start_date" || key === "end_date") {
        const start = key === "start_date" ? (value as string) : prev.start_date;
        const end = key === "end_date" ? (value as string) : prev.end_date;
        if (start && end) {
          next.duration = String(calcDuration(start, end));
        }
      }
      return next;
    });
    // Clear error for the changed field on next render
    if (errors[key]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    }
  }

  function handleBlur(field: keyof SubmitFormState) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  // ─── Submit ──────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Mark all fields as touched so errors show
    const allTouched = Object.fromEntries(
      Object.keys(EMPTY_FORM).map((k) => [k, true])
    ) as typeof touched;
    setTouched(allTouched);

    const validationErrors = validateForm(form);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      // scroll to first error
      const firstErrorField = document.querySelector("[aria-invalid='true'], .field-input.error");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstErrorField as HTMLElement).focus?.();
      }
      return;
    }

    setStatus("submitting");
    setErrors({});

    // ── reCAPTCHA v3 ────────────────────────────────────
    let recaptchaToken = "";
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (siteKey && typeof window !== "undefined") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const grecaptcha = (window as any).grecaptcha;
        if (grecaptcha) {
          recaptchaToken = await new Promise<string>((resolve) => {
            grecaptcha.ready(() => {
              grecaptcha
                .execute(siteKey, { action: "submit" })
                .then(resolve)
                .catch(() => resolve(""));
            });
          });
        }
      } catch {
        // reCAPTCHA unavailable (dev / adblock) — proceed without token
      }
    }

    const result = await submitEvent(form, recaptchaToken);

    if (result.ok) {
      setStatus("success");
      setApiMessage(result.message);
      setForm(EMPTY_FORM);
      setTouched({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStatus("error");
      setApiMessage(result.message);
    }
  }

  // ─── Derived error display ────────────────────────────────
  // Only show errors for touched fields (or after submit attempt)
  function visibleError(field: keyof SubmitFormState): string | undefined {
    return touched[field] ? errors[field] : undefined;
  }

  const inputClass = (field: keyof SubmitFormState) =>
    `field-input${visibleError(field) ? " error" : ""}`;

  const ariaProps = (field: keyof SubmitFormState) =>
    visibleError(field)
      ? {
          "aria-invalid": true as const,
          "aria-describedby": `${field}-error`,
        }
      : {};

  // ─── Success state ───────────────────────────────────────
  if (status === "success") {
    return (
      <div
        className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-4xl mb-3" aria-hidden="true">🎉</div>
        <h2
          className="text-xl font-semibold text-green-800 mb-1"
          style={{ fontFamily: "var(--font-secondary)" }}
        >
          Evento submetido com sucesso!
        </h2>
        <p className="text-green-700 text-sm mb-4">
          O teu evento será analisado pela equipa e publicado em breve.
        </p>
        <p className="text-green-600 text-xs mb-6">{apiMessage}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setApiMessage("");
          }}
          className="px-5 py-2.5 rounded-lg bg-[#2d373c] text-white text-sm font-medium hover:bg-[#3f5057] transition-colors"
        >
          Submeter outro evento
        </button>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────
  return (
    <>
      {/* Global error banner */}
      {status === "error" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 mb-4 text-sm text-red-700"
          role="alert"
          aria-live="assertive"
        >
          <strong>Erro ao submeter:</strong> {apiMessage}
        </div>
      )}

      <form
        id="submitEvent"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulário de submissão de evento"
        className="space-y-5"
      >
        {/* ══ SECÇÃO 1: Identificação ══════════════════════ */}
        <SectionCard
          title="1. Identificação do evento"
          description="Nome e categoria do evento."
        >
          <FormField
            id="eventName"
            label="Nome do Evento"
            required
            error={visibleError("eventName")}
          >
            <input
              type="text"
              id="eventName"
              name="eventName"
              className={inputClass("eventName")}
              value={form.eventName}
              onChange={(e) => setField("eventName", e.target.value)}
              onBlur={() => handleBlur("eventName")}
              maxLength={256}
              placeholder="Ex.: Festa de Santo António"
              autoComplete="off"
              aria-required="true"
              {...ariaProps("eventName")}
            />
          </FormField>

          <FormField
            id="category"
            label="Categoria"
            required
            error={visibleError("category")}
          >
            <select
              id="category"
              name="category"
              className={inputClass("category")}
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              onBlur={() => handleBlur("category")}
              aria-required="true"
              {...ariaProps("category")}
            >
              <option value="">Selecionar categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </FormField>
        </SectionCard>

        {/* ══ SECÇÃO 2: Localização ═════════════════════════ */}
        <SectionCard
          title="2. Localização"
          description="Distrito, concelho, freguesia e nome do local."
        >
          <LocationSelects
            districts={districts}
            districtValue={form.district}
            cityValue={form.city}
            townshipValue={form.township}
            errors={{
              district: visibleError("district"),
              city: visibleError("city"),
              township: visibleError("township"),
            }}
            onChange={(field, value) => {
              setField(field, value);
              setTouched((t) => ({ ...t, [field]: true }));
            }}
          />

          <FormField
            id="place"
            label="Local"
            required
            error={visibleError("place")}
            hint="Nome do espaço onde decorre o evento (ex.: Largo da Igreja)."
          >
            <input
              type="text"
              id="place"
              name="place"
              className={inputClass("place")}
              value={form.place}
              onChange={(e) => setField("place", e.target.value)}
              onBlur={() => handleBlur("place")}
              maxLength={128}
              placeholder="Ex.: Largo da Igreja"
              autoComplete="off"
              aria-required="true"
              {...ariaProps("place")}
            />
          </FormField>
        </SectionCard>

        {/* ══ SECÇÃO 3: Datas ══════════════════════════════ */}
        <SectionCard
          title="3. Datas e duração"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              id="start_date"
              label="Data de início"
              required
              error={visibleError("start_date")}
            >
              <input
                type="date"
                id="start_date"
                name="start_date"
                className={inputClass("start_date")}
                value={form.start_date}
                onChange={(e) => setField("start_date", e.target.value)}
                onBlur={() => handleBlur("start_date")}
                aria-required="true"
                {...ariaProps("start_date")}
              />
            </FormField>

            <FormField
              id="end_date"
              label="Data de fim"
              required
              error={visibleError("end_date")}
            >
              <input
                type="date"
                id="end_date"
                name="end_date"
                className={inputClass("end_date")}
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(e) => setField("end_date", e.target.value)}
                onBlur={() => handleBlur("end_date")}
                aria-required="true"
                {...ariaProps("end_date")}
              />
            </FormField>

            <FormField
              id="duration"
              label="Duração (dias)"
              required
              error={visibleError("duration")}
              hint="Calculado automaticamente."
            >
              <input
                type="number"
                id="duration"
                name="duration"
                className={inputClass("duration")}
                value={form.duration}
                onChange={(e) => setField("duration", e.target.value)}
                onBlur={() => handleBlur("duration")}
                min={1}
                max={99999999999}
                maxLength={11}
                inputMode="numeric"
                aria-required="true"
                {...ariaProps("duration")}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* ══ SECÇÃO 4: Coordenadas ════════════════════════ */}
        <SectionCard
          title="4. Coordenadas GPS"
          description="Usadas para mostrar o evento no mapa."
        >
          {/* Map button — full-width row above the coordinate fields */}
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#2d373c] text-[#2d373c] text-sm font-semibold hover:bg-[#2d373c] hover:text-white transition-colors"
            aria-label="Abrir mapa para selecionar localização"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Pesquisar no mapa
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Latitude */}
            <FormField
              id="lat"
              label="Latitude"
              required
              error={visibleError("lat")}
              hint="Ex.: 39.159354"
            >
              <input
                type="text"
                id="lat"
                name="lat"
                className={inputClass("lat")}
                value={form.lat}
                onChange={(e) => setField("lat", e.target.value)}
                onBlur={() => handleBlur("lat")}
                placeholder="39.159354"
                inputMode="decimal"
                pattern="^(\+|-)?(?:90(?:\.0{1,6})?|(?:[0-9]|[1-8][0-9])(?:\.[0-9]{1,6})?)$"
                aria-required="true"
                {...ariaProps("lat")}
              />
            </FormField>

            {/* Longitude */}
            <FormField
              id="lon"
              label="Longitude"
              required
              error={visibleError("lon")}
              hint="Ex.: -8.788921"
            >
              <input
                type="text"
                id="lon"
                name="lon"
                className={inputClass("lon")}
                value={form.lon}
                onChange={(e) => setField("lon", e.target.value)}
                onBlur={() => handleBlur("lon")}
                placeholder="-8.788921"
                inputMode="decimal"
                pattern="^(\+|-)?(?:180(?:\.0{1,6})?|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.[0-9]{1,6})?)$"
                aria-required="true"
                {...ariaProps("lon")}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* ══ SECÇÃO 5: Imagem ══════════════════════════════ */}
        <SectionCard
          title="5. Cartaz / Imagem"
          description="Insere a URL de uma imagem ou faz upload de um ficheiro (máx. 3 MB)."
        >
          <ImageInput
            imageUrl={form.image_url}
            imageFile={form.image_up}
            errors={{
              image_url: visibleError("image_url"),
              image_up: visibleError("image_up"),
            }}
            onUrlChange={(url) => {
              setField("image_url", url);
              setTouched((t) => ({ ...t, image_url: true }));
            }}
            onFileChange={(file) => {
              setField("image_up", file);
              setTouched((t) => ({ ...t, image_up: true }));
            }}
          />
        </SectionCard>

        {/* ══ SECÇÃO 6: Detalhes adicionais ════════════════ */}
        <SectionCard
          title="6. Descrição"
          description="Descrição do evento — obrigatória (mínimo 10 caracteres)."
        >
          <FormField
            id="description"
            label="Descrição"
            required
            error={visibleError("description")}
          >
            <textarea
              id="description"
              name="description"
              className={inputClass("description")}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              rows={4}
              maxLength={6192}
              placeholder="Descreve o evento, programa, artistas, atrações…"
              aria-required="true"
              {...ariaProps("description")}
            />
            <p className="field-hint text-right">
              {form.description.length} / 6192
            </p>
          </FormField>
        </SectionCard>

        {/* ══ SECÇÃO 7: Contacto e informações opcionais ═══ */}
        <SectionCard
          title="7. Contacto e informações opcionais"
          description="Todos os campos desta secção são opcionais."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="price"
              label="Preço"
              error={visibleError("price")}
              hint="Deixa em branco se for gratuito."
            >
              <input
                type="text"
                id="price"
                name="price"
                className={inputClass("price")}
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                onBlur={() => handleBlur("price")}
                maxLength={10}
                placeholder="Ex.: 5€ ou Gratuito"
              />
            </FormField>

            <FormField
              id="contact"
              label="Contacto (telefone)"
              error={visibleError("contact")}
            >
              <input
                type="tel"
                id="contact"
                name="contact"
                className={inputClass("contact")}
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
                onBlur={() => handleBlur("contact")}
                maxLength={9}
                placeholder="912345678"
                inputMode="numeric"
                autoComplete="tel"
              />
            </FormField>

            <FormField
              id="email"
              label="Email"
              error={visibleError("email")}
            >
              <input
                type="email"
                id="email"
                name="email"
                className={inputClass("email")}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                maxLength={128}
                placeholder="contacto@evento.pt"
                autoComplete="email"
                inputMode="email"
              />
            </FormField>

            <FormField
              id="website"
              label="Website"
              error={visibleError("website")}
            >
              <input
                type="url"
                id="website"
                name="website"
                className={inputClass("website")}
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                onBlur={() => handleBlur("website")}
                maxLength={128}
                placeholder="https://exemplo.pt"
                autoComplete="url"
                inputMode="url"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* ══ Submit button ════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#2d373c] text-white font-semibold text-sm hover:bg-[#3f5057] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#fbad1a]"
          >
            {status === "submitting" ? (
              <>
                <span className="spinner" aria-hidden="true" />
                A submeter…
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Submeter evento
              </>
            )}
          </button>

          <p className="text-xs text-[#6b7280] leading-relaxed">
            * Campos obrigatórios. Caso pretendas destacar a tua festa ou arraial,
            entra em contacto em{" "}
            <a
              href="mailto:info@festasearraiais.pt"
              className="underline hover:text-[#2d373c] transition-colors"
            >
              info@festasearraiais.pt
            </a>
          </p>
        </div>
      </form>

      {/* ── Map modal ──────────────────────────────────────── */}
      {mapOpen && (
        <MapModal
          lat={form.lat}
          lon={form.lon}
          onConfirm={(lat, lon) => {
            setField("lat", lat);
            setField("lon", lon);
            setTouched((t) => ({ ...t, lat: true, lon: true }));
          }}
          onClose={() => setMapOpen(false)}
        />
      )}
    </>
  );
}
