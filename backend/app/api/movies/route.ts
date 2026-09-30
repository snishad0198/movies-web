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
    const year = searchParams.get("year");
    const language = searchParams.get("language");
    const sort = searchParams.get("sort") || "popularity"; // popularity, rating, latest
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    // 1. Fetch from TMDB discover/movie with parameters
    const tmdbParams: Record<string, string> = {
      page: String(page),
      region: "IN",
      include_adult: "false",
      sort_by: "popularity.desc",
    };

    if (year) {
      tmdbParams["primary_release_year"] = year;
    } else {
      tmdbParams["primary_release_date.lte"] = new Date().toISOString().split("T")[0];
    }

    if (genre) {
      const gid = getGenreIdByName(genre);
      if (gid) tmdbParams["with_genres"] = String(gid);
    }

    const category = searchParams.get("category");
    const yearRange = searchParams.get("yearRange");

    if (category === "bollywood") {
      tmdbParams["with_original_language"] = "hi";
      tmdbParams["region"] = "IN";
    } else if (category === "hollywood") {
      tmdbParams["with_original_language"] = "en";
    } else if (category === "south") {
      tmdbParams["with_original_language"] = "te|ta|ml|kn";
      tmdbParams["region"] = "IN";
    } else if (category === "old" || category === "classic") {
      tmdbParams["primary_release_date.lte"] = "2015-01-01";
      tmdbParams["sort_by"] = "popularity.desc";
    } else if (category === "punjabi") {
      tmdbParams["with_original_language"] = "pa";
    } else if (category === "animation" || category === "anime") {
      tmdbParams["with_genres"] = "16";
    }

    if (yearRange === "2020s") {
      tmdbParams["primary_release_date.gte"] = "2020-01-01";
      tmdbParams["primary_release_date.lte"] = "2023-12-31";
    } else if (yearRange === "2010s") {
      tmdbParams["primary_release_date.gte"] = "2010-01-01";
      tmdbParams["primary_release_date.lte"] = "2019-12-31";
    } else if (yearRange === "vintage") {
      tmdbParams["primary_release_date.lte"] = "2000-01-01";
    }

    const [tmdbData, dbMovies] = await Promise.all([
      fetchFromTmdb("discover/movie", tmdbParams).catch(() => ({ results: [], total_pages: 1 })),
      page === 1
        ? db.movie.findMany({
            where: { type: "MOVIE", status: "PUBLISHED" },
            take: 10,
            include: { genres: { include: { genre: true } } },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    const formattedDb = dbMovies.map((m: any) => ({
      ...m,
      imdbRating: m.imdbRating ? Number(m.imdbRating) : null,
      genres: m.genres ? m.genres.map((g: any) => g.genre) : [],
    }));

    const formattedTmdb = (tmdbData.results || [])
      .filter((m: any) => Boolean(m.poster_path || m.backdrop_path))
      .map((m: any) => formatTmdbItem(m, "MOVIE"));

    const movies = formattedTmdb.filter((m: any) => !m.adult && !m.isAdult);

    return NextResponse.json({
      success: true,
      data: movies,
      pagination: {
        total: tmdbData.total_results || 1000,
        page,
        limit: 20,
        totalPages: Math.min(tmdbData.total_pages || 50, 500),
      },
    });
  } catch (err: any) {
    console.error("Error fetching movies catalog:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
