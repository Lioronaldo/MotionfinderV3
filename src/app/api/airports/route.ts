import { NextResponse } from "next/server";
import { searchAirports } from "@/lib/airports";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? "12");
  const results = await searchAirports(q, Number.isFinite(limit) ? Math.max(1, Math.min(30, limit)) : 12);

  return NextResponse.json(
    { ok: true, results },
    { status: 200, headers: { "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" } }
  );
}
