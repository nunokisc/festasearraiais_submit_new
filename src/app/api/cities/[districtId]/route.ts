// =============================================================
// GET /api/cities/[districtId]
// Server-side proxy → backoffice_api /v1/public/cities/by-district/:id
// The backoffice API URL never reaches the browser.
// =============================================================

import { NextRequest, NextResponse } from "next/server";

const BACKOFFICE_API =
  process.env.BACKOFFICE_API_URL ?? "https://backoffice-api.festasearraiais.pt";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ districtId: string }> }
) {
  const { districtId } = await params;

  if (!districtId || !/^\d+$/.test(districtId)) {
    return NextResponse.json(
      { status: "nok", msg: "Parâmetro inválido.", data: [] },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${BACKOFFICE_API}/v1/public/cities/by-district/${districtId}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "nok", msg: "Erro de ligação com o servidor.", data: [] },
      { status: 502 }
    );
  }
}
