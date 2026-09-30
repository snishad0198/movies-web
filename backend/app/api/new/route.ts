import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { fetchFromTmdb, formatTmdbItem } from "@/lib/tmdb";

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
    const [tmdbNewMovies, tmdbNewSeries, dbItems] = await Promise.all([
      fetchFromTmdb("discover/movie", {
        region: "IN",
        sort_by: "primary_release_date.desc",
        "primary_release_date.lte": new Date().toISOString().split("T")[0],
        include_adult: "false",
      }).catch(() => ({ results: [] })),
      fetchFromTmdb("discover/tv", {
        region: "IN",
        sort_by: "first_air_date.desc",
        include_adult: "false",
      }).catch(() => ({ results: [] })),
      db.movie.findMany({
        where: { status: "PUBLISHED" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { genres: { include: { genre: true } } },
      }).catch(() => []),
    ]);

    const formattedDb = dbItems.map((m: any) => ({
      ...m,
      imdbRating: m.imdbRating ? Number(m.imdbRating) : null,
      genres: m.genres ? m.genres.map((g: any) => g.genre) : [],
    }));

    const tmdbList = [
      ...(tmdbNewMovies.results || []).map((m: any) => formatTmdbItem(m, "MOVIE")),
      ...(tmdbNewSeries.results || []).map((s: any) => formatTmdbItem(s, "SERIES")),
    ].filter((item: any) => Boolean(item.poster || item.backdrop));

    const combined = tmdbList.slice(0, 50);

    return NextResponse.json({
      success: true,
      data: combined,
    });
  } catch (err: any) {
    console.error("Error fetching new releases:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
