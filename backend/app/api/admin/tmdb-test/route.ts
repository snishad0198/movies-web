import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getActiveTmdbApiKey } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let apiKey = (body.apiKey || "").trim();

    if (!apiKey) {
      apiKey = await getActiveTmdbApiKey();
    }

    if (!apiKey || apiKey === "your-tmdb-api-key-here") {
      return NextResponse.json(
        { success: false, error: "No TMDB API key provided. Please enter a valid API key." },
        { status: 400 }
      );
    }

    const testUrl = `https://api.themoviedb.org/3/movie/550?api_key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(testUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        success: true,
        message: `TMDB connection verified! Successfully connected to TMDB (Sample: "${data.title || "Fight Club"}").`,
      });
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: false,
        error: errData.status_message || "Invalid TMDB API key (HTTP " + res.status + ")",
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to connect to TMDB: " + err.message },
      { status: 500 }
    );
  }
}
