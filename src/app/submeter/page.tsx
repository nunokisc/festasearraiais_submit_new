// =============================================================
// /submeter — Public event submission page
//
// Server Component: fetches auxiliary data (districts, categories)
// and passes it to the SubmitForm client component.
//
// API calls use NO auth token (public endpoints added to
// backoffice_api: /v1/public/districts and /v1/public/categories).
// =============================================================

import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm/SubmitForm";
import { getDistricts, getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Submeter Evento | Festas & Arraiais",
  description:
    "Submete um evento para o Festas & Arraiais. Preenche os dados da tua festa, arraial ou evento tradicional e será publicado após análise.",
  openGraph: {
    title: "Submeter Evento | Festas & Arraiais",
    description:
      "Submete um evento para o Festas & Arraiais.",
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://adicionar.festasearraiais.pt"}/submeter`,
  },
};

// Revalidate auxiliary data every 30 minutes
export const revalidate = 1800;

export default async function SubmeterPage() {
  // Fetch in parallel — both are public endpoints, no auth required
  const [districts, categories] = await Promise.all([
    getDistricts(),
    getCategories(),
  ]);

  const mainSite =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://festasearraiais.pt";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="mb-8">
        <nav aria-label="Navegação estrutural" className="mb-3">
          <ol className="flex items-center gap-1.5 text-sm text-[#6b7280]">
            <li>
              <a
                href={mainSite}
                className="hover:text-[#2d373c] transition-colors"
              >
                Festas &amp; Arraiais
              </a>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <span className="text-[#2d373c] font-medium" aria-current="page">
                Submeter Evento
              </span>
            </li>
          </ol>
        </nav>

        <h1
          className="text-2xl sm:text-3xl font-bold text-[#2d373c] mb-2"
          style={{ fontFamily: "var(--font-secondary)" }}
        >
          Submeter Evento
        </h1>
        <p className="text-[#6b7280] text-sm sm:text-base max-w-2xl">
          Preenche o formulário para adicionar a tua festa, arraial ou evento
          tradicional ao{" "}
          <a
            href={mainSite}
            className="text-[#2d373c] font-medium hover:underline"
          >
            Festas &amp; Arraiais
          </a>
          . Os campos marcados com{" "}
          <span className="text-[#c0392b] font-semibold" aria-label="asterisco — campo obrigatório">
            *
          </span>{" "}
          são obrigatórios.
        </p>
      </div>

      {/* ── Warning if auxiliary data is unavailable ───────── */}
      {(districts.length === 0 || categories.length === 0) && (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"
          role="alert"
        >
          <strong>Atenção:</strong> Não foi possível carregar alguns dados
          auxiliares (distritos ou categorias). Verifica a tua ligação e
          recarrega a página.
        </div>
      )}

      {/* ── Form ────────────────────────────────────────────── */}
      <SubmitForm districts={districts} categories={categories} />
    </div>
  );
}
