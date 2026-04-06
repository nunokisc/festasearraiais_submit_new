// =============================================================
// /api/submit — Next.js Route Handler
//
// 1. Receives multipart/form-data from the public submit form
// 2. Verifies the reCAPTCHA v3 token server-side (secret key
//    never leaves the server)
// 3. Forwards the data (without the recaptcha token) to the
//    backoffice_api: POST /v1/submited/events/event
// 4. Returns the backoffice_api response to the client
//
// Mirrors the logic of the legacy PHP insertEvent.php
// validateCapcha() function.
// =============================================================

import { NextRequest, NextResponse } from "next/server";

const BACKOFFICE_API =
  process.env.NEXT_PUBLIC_BACKOFFICE_API_URL ??
  "https://backoffice-api.festasearraiais.pt";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY ?? "";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_MIN_SCORE = 0.5; // mirrors PHP threshold

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { status: "nok", msg: "Dados inválidos.", data: [] },
      { status: 400 }
    );
  }

  // ── reCAPTCHA verification ──────────────────────────────
  if (RECAPTCHA_SECRET && RECAPTCHA_SITE_KEY) {
    const token = formData.get("g-recaptcha-response") as string | null;

    if (!token) {
      return NextResponse.json(
        { status: "nok", msg: "Captcha inválido.", data: [] },
        { status: 400 }
      );
    }

    try {
      const verifyRes = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
        }
      );
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        return NextResponse.json(
          { status: "nok", msg: "Erro no captcha. Tenta novamente.", data: [] },
          { status: 400 }
        );
      }

      // Action check (mirrors PHP: action must be 'submit')
      if (verifyData.action && verifyData.action !== "submit") {
        return NextResponse.json(
          { status: "nok", msg: "Captcha inválido.", data: [] },
          { status: 400 }
        );
      }

      // Score check (mirrors PHP: score < 0.5 → rejected)
      if (
        typeof verifyData.score === "number" &&
        verifyData.score < RECAPTCHA_MIN_SCORE
      ) {
        return NextResponse.json(
          {
            status: "nok",
            msg: "Captcha com score muito baixo. Talvez sejas um bot…",
            data: [],
          },
          { status: 400 }
        );
      }
    } catch {
      // Network error reaching Google — fail open to not block legitimate users
      // (same decision as PHP: only block on explicit failure)
    }
  }

  // ── Remove recaptcha token before forwarding ───────────
  formData.delete("g-recaptcha-response");

  // ── Forward to backoffice_api ──────────────────────────
  try {
    const apiRes = await fetch(
      `${BACKOFFICE_API}/v1/submited/events/event`,
      {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — fetch sets multipart boundary automatically
      }
    );

    const json = await apiRes.json();
    return NextResponse.json(json, { status: apiRes.status });
  } catch {
    return NextResponse.json(
      {
        status: "nok",
        msg: "Erro de ligação com o servidor. Tenta novamente.",
        data: [],
      },
      { status: 502 }
    );
  }
}
