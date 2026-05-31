import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In docker-compose: BACKEND_URL=http://modelops-backend:8000
// In local dev (next dev outside compose): falls back to localhost
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  let body: { useCase?: string; dataset?: string; rows?: string; lang?: "fr" | "en" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const useCase = typeof body.useCase === "string" ? body.useCase.trim().slice(0, 200) : "";
  const dataset = typeof body.dataset === "string" ? body.dataset.trim().slice(0, 200) : "";
  const rows = typeof body.rows === "string" ? body.rows.trim().slice(0, 30) : "";
  const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

  if (!useCase) {
    return NextResponse.json(
      { error: lang === "fr" ? "Decrivez votre cas d'usage." : "Describe your use case." },
      { status: 400 }
    );
  }

  try {
    const r = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ use_case: useCase, dataset, rows, lang }),
      cache: "no-store",
    });
    const j = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: j.detail || "backend_error" }, { status: r.status });
    }
    return NextResponse.json({
      brief: j.brief,
      model: j.model,
      generatedAt: j.generated_at,
      staticMode: Boolean(j.static_mode),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown_error";
    return NextResponse.json({ error: `backend_unreachable: ${msg}` }, { status: 502 });
  }
}
