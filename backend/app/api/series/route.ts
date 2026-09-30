import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { fetchFromTmdb, formatTmdbItem, getGenreIdByName } from "@/lib/tmdb";

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
    const genre = searchParams.get("genre");
    const language = searchParams.get("language");
    const sort = searchParams.get("sort") || "popular";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const tmdbParams: Record<string, string> = {
      page: String(page),
      region: "IN",
      include_adult: "false",
      sort_by: "popularity.desc",
      "first_air_date.lte": new Date().toISOString().split("T")[0],
    };

    if (genre) {
      const gid = getGenreIdByName(genre);
      if (gid) tmdbParams["with_genres"] = String(gid);
    }

    const category = searchParams.get("category");

    if (category === "indian") {
      tmdbParams["with_original_language"] = "hi";
      tmdbParams["region"] = "IN";
    } else if (category === "hollywood") {
      tmdbParams["with_original_language"] = "en";
    } else if (category === "anime") {
      tmdbParams["with_genres"] = "16";
      tmdbParams["with_original_language"] = "ja";
    } else if (category === "kdrama") {
      tmdbParams["with_original_language"] = "ko";
    } else if (category === "old" || category === "classic") {
      tmdbParams["first_air_date.lte"] = "2018-01-01";
      tmdbParams["sort_by"] = "popularity.desc";
    }

    if (language && language.toLowerCase() === "hindi") {
      tmdbParams["with_original_language"] = "hi";
    } else if (language && language.toLowerCase() === "english") {
      tmdbParams["with_original_language"] = "en";
    }

    if (sort === "rating") {
      tmdbParams["sort_by"] = "vote_average.desc";
      tmdbParams["vote_count.gte"] = "50";
    } else if (sort === "latest") {
      tmdbParams["sort_by"] = "first_air_date.desc";
      tmdbParams["first_air_date.gte"] = "2024-01-01";
    } else {
      tmdbParams["sort_by"] = "popularity.desc";
    }

    const [tmdbData, dbSeries] = await Promise.all([
      fetchFromTmdb("discover/tv", tmdbParams).catch(() => ({ results: [], total_pages: 1 })),
      page === 1
        ? db.movie.findMany({
            where: { type: "SERIES", status: "PUBLISHED" },
            take: 10,
            include: { genres: { include: { genre: true } } },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const formattedDb = dbSeries.map((m: any) => ({
      ...m,
      imdbRating: m.imdbRating ? Number(m.imdbRating) : null,
      genres: m.genres ? m.genres.map((g: any) => g.genre) : [],
    }));

    const formattedTmdb = (tmdbData.results || [])
      .filter((m: any) => Boolean(m.poster_path || m.backdrop_path))
      .map((m: any) => formatTmdbItem(m, "SERIES"));

    const series = formattedTmdb.filter((m: any) => !m.adult && !m.isAdult);

    return NextResponse.json({
      success: true,
      data: series,
      pagination: {
        total: tmdbData.total_results || 1000,
        page,
        limit: 20,
        totalPages: Math.min(tmdbData.total_pages || 50, 500),
      },
    });
  } catch (err: any) {
    console.error("Error fetching series catalog:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
