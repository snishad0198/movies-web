import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { getTmdbFullDetails } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 120)) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  const access = await verifyApiAccess(req);
  if (!access.authorized) {
    return NextResponse.json({ success: false, error: access.reason }, { status: 403 });
  }

  try {
    const { slug } = params;

    // 1. Check local database first (allows admin overrides & custom seeded movies)
    let tmdbIdMatch = slug.match(/-?(\d+)$/)?.[1];
    let movie: any = null;
    try {
      movie = await db.movie.findFirst({
        where: {
          OR: [
            { slug },
            { id: !isNaN(parseInt(slug, 10)) ? parseInt(slug, 10) : undefined },
            { tmdbId: tmdbIdMatch || slug },
          ],
          status: "PUBLISHED",
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
          streamSources: {
            orderBy: { sortOrder: "asc" },
          },
          downloadLinks: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    } catch (dbErr) {
      console.warn(`[Local DB] Warning: lookup failed for movie "${slug}", falling back to TMDB:`, dbErr);
    }

    if (movie) {
      // Fetch 6 related movies with overlapping genres
      let related: any[] = [];
      try {
        const genreIds = movie.genres.map((g: any) => g.genreId);
        related = await db.movie.findMany({
          where: {
            id: { not: movie.id },
            type: "MOVIE",
            status: "PUBLISHED",
            genres: {
              some: {
                genreId: { in: genreIds },
              },
            },
          },
          take: 6,
          orderBy: { viewCount: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            poster: true,
            releaseYear: true,
            imdbRating: true,
          },
        });
      } catch (relErr) {
        console.warn("[Local DB] Warning: failed to fetch related movies:", relErr);
      }

      return NextResponse.json({
        success: true,
        data: {
          ...movie,
          imdbRating: movie.imdbRating ? Number(movie.imdbRating) : null,
          genres: movie.genres.map((g: any) => g.genre),
          related: related.map((r) => ({
            ...r,
            imdbRating: r.imdbRating ? Number(r.imdbRating) : null,
          })),
        },
      });
    }

    // 2. Not in local DB -> Fetch live from TMDB!
    const tmdbData = await getTmdbFullDetails(slug, false);
    if (!tmdbData) {
      return NextResponse.json({ success: false, error: "Movie not found" }, { status: 404 });
    }

    const tmdbId = tmdbData.tmdbId;
    const cleanTitle = encodeURIComponent(tmdbData.title);

    // Guaranteed stream sources for TMDB title
    const streamSources = [
      { id: 101, serverName: "VIP MultiEmbed (Auto)", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`, isEmbed: true },
      { id: 102, serverName: "VIP VidSrc (Dual Audio)", url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`, isEmbed: true },
      { id: 103, serverName: "VIP Embed.su (4K HDR)", url: `https://embed.su/embed/movie/${tmdbId}`, isEmbed: true },
      { id: 104, serverName: "AutoEmbed Ultra", url: `https://autoembed.co/movie/tmdb/${tmdbId}`, isEmbed: true },
      { id: 105, serverName: "VidLink HD", url: `https://vidlink.pro/movie/${tmdbId}`, isEmbed: true },
    ];

    // Guaranteed cloud download mirrors
    const downloadLinks = [
      { id: 201, quality: "1080p FHD", sizeLabel: "2.4 GB", url: `https://gofile.io/d/search?q=${cleanTitle}`, provider: "GoFile High-Speed" },
      { id: 202, quality: "720p HD", sizeLabel: "1.1 GB", url: `https://mega.nz/search/${cleanTitle}`, provider: "Mega Fast Cloud" },
      { id: 203, quality: "480p SD", sizeLabel: "450 MB", url: `https://pixeldrain.com/search?q=${cleanTitle}`, provider: "PixelDrain Mobile Direct" },
      { id: 204, quality: "4K UHD", sizeLabel: "6.5 GB", url: `https://1fichier.com/search?q=${cleanTitle}`, provider: "VIP 4K Ultra Mirror" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        ...tmdbData,
        streamSources,
        downloadLinks,
      },
    });
  } catch (err: any) {
    console.error("Error fetching movie details:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
