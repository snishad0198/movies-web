import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { logActivity } from "@/lib/analytics";
import { searchTmdb } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 120)) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  const access = await verifyApiAccess(req);
  if (!access.authorized) {
    return NextResponse.json({ success: false, error: access.reason }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const type = searchParams.get("type"); // MOVIE, SERIES, or ALL

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    logActivity("SEARCH", {
      value: query,
      ip,
      userAgent: req.headers.get("user-agent") || undefined,
    }).catch(() => {});

    // Search both local DB and TMDB concurrently
    const [dbResults, tmdbResults] = await Promise.all([
      db.movie.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { director: { contains: query } },
            { tags: { contains: query } },
          ],
          ...(type && type !== "ALL" ? { type: type as any } : {}),
        },
        take: 12,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          poster: true,
          backdrop: true,
          releaseYear: true,
          runtime: true,
          language: true,
          imdbRating: true,
          viewCount: true,
        },
      }).catch(() => []),
      searchTmdb(query, type || undefined),
    ]);

    const formattedDb = dbResults.map((m: any) => ({
      ...m,
      imdbRating: m.imdbRating ? Number(m.imdbRating) : null,
    }));

    // Deduplicate by title
    const seenTitles = new Set(formattedDb.map((m: any) => m.title.toLowerCase().trim()));
    const filteredTmdb = tmdbResults.filter(
      (m: any) => !seenTitles.has(m.title.toLowerCase().trim())
    );

    const combined = [...formattedDb, ...filteredTmdb];

    return NextResponse.json({
      success: true,
      data: combined,
    });
  } catch (err: any) {
    console.error("Live search error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
