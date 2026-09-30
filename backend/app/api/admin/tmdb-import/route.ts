import { NextRequest, NextResponse } from "next/server";
import { importTmdbDetails } from "@/lib/tmdb";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { tmdbId, type = "movie" } = body;

    if (!tmdbId) {
      return NextResponse.json({ success: false, error: "Missing TMDB ID" }, { status: 400 });
    }

    const details = await importTmdbDetails(String(tmdbId).trim(), type === "tv" ? "tv" : "movie");
    return NextResponse.json({ success: true, data: details });
  } catch (err: any) {
    console.error("TMDB Import error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch from TMDB" },
      { status: 500 }
    );
  }
}
