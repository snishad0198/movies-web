import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { getTmdbFullDetails, getTmdbTvSeasonEpisodes } from "@/lib/tmdb";

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

    // 1. Check local database first
    const tmdbIdMatch = slug.match(/-?(\d+)$/)?.[1];
    let series: any = null;
    try {
      series = await db.movie.findFirst({
        where: {
          OR: [
            { slug },
            { id: !isNaN(parseInt(slug, 10)) ? parseInt(slug, 10) : undefined },
            { tmdbId: tmdbIdMatch || slug },
          ],
          type: "SERIES",
          status: "PUBLISHED",
        },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
          seasons: {
            orderBy: { seasonNumber: "asc" },
            include: {
              episodes: {
                orderBy: { episodeNumber: "asc" },
                include: {
                  streamSources: {
                    orderBy: { sortOrder: "asc" },
                  },
                  downloadLinks: {
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn(`[Local DB] Warning: lookup failed for series "${slug}", falling back to TMDB:`, dbErr);
    }

    if (series) {
      let related: any[] = [];
      try {
        const genreIds = series.genres.map((g: any) => g.genreId);
        related = await db.movie.findMany({
          where: {
            id: { not: series.id },
            type: "SERIES",
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
        console.warn("[Local DB] Warning: failed to fetch related series:", relErr);
      }

      return NextResponse.json({
        success: true,
        data: {
          ...series,
          imdbRating: series.imdbRating ? Number(series.imdbRating) : null,
          genres: series.genres.map((g: any) => g.genre),
          related: related.map((r) => ({
            ...r,
            imdbRating: r.imdbRating ? Number(r.imdbRating) : null,
          })),
        },
      });
    }

    // 2. Not in local DB -> Fetch live TV Series from TMDB!
    const tmdbData = await getTmdbFullDetails(slug, true);
    if (!tmdbData) {
      return NextResponse.json({ success: false, error: "Series not found" }, { status: 404 });
    }

    const tmdbId = tmdbData.tmdbId;

    // Fetch episodes for Season 1
    let seasons = tmdbData.seasons || [];
    if (seasons.length > 0) {
      const firstSeasonNum = seasons[0].seasonNumber || 1;
      const s1Episodes = await getTmdbTvSeasonEpisodes(tmdbId, firstSeasonNum);

      seasons[0].episodes = s1Episodes.map((ep: any) => {
        const epNum = ep.episodeNumber;
        return {
          ...ep,
          streamSources: [
            { id: 101, serverName: "VIP MultiEmbed", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${firstSeasonNum}&e=${epNum}`, isEmbed: true },
            { id: 102, serverName: "VIP VidSrc (Dual Audio)", url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&sea=${firstSeasonNum}&epi=${epNum}`, isEmbed: true },
            { id: 103, serverName: "VIP Embed.su", url: `https://embed.su/embed/tv/${tmdbId}/${firstSeasonNum}/${epNum}`, isEmbed: true },
            { id: 104, serverName: "AutoEmbed Fast", url: `https://autoembed.co/tv/tmdb/${tmdbId}-${firstSeasonNum}-${epNum}`, isEmbed: true },
            { id: 105, serverName: "VidLink HD", url: `https://vidlink.pro/tv/${tmdbId}/${firstSeasonNum}/${epNum}`, isEmbed: true },
          ],
          downloadLinks: [
            { id: 201, quality: "1080p FHD", sizeLabel: "750 MB", url: `https://gofile.io/d/search?q=${encodeURIComponent(tmdbData.title)}+S01E0${epNum}`, provider: "GoFile High-Speed" },
            { id: 202, quality: "720p HD", sizeLabel: "350 MB", url: `https://mega.nz/search/${encodeURIComponent(tmdbData.title)}+S01E0${epNum}`, provider: "Mega Fast Cloud" },
          ],
        };
      });
    } else {
      // Fallback 1 season with default episodes
      seasons = [
        {
          id: 1,
          seasonNumber: 1,
          seasonNum: 1,
          title: "Season 1",
          episodes: [1, 2, 3, 4, 5, 6].map((num) => ({
            id: num,
            episodeNumber: num,
            episodeNum: num,
            title: `Episode ${num}`,
            duration: 35,
            streamSources: [
              { id: 101, serverName: "VIP MultiEmbed", url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=1&e=${num}`, isEmbed: true },
              { id: 102, serverName: "VIP VidSrc", url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&sea=1&epi=${num}`, isEmbed: true },
              { id: 103, serverName: "VIP Embed.su", url: `https://embed.su/embed/tv/${tmdbId}/1/${num}`, isEmbed: true },
            ],
            downloadLinks: [
              { id: 201, quality: "1080p FHD", sizeLabel: "750 MB", url: `https://gofile.io/d/search?q=${encodeURIComponent(tmdbData.title)}+S01E0${num}`, provider: "GoFile High-Speed" },
              { id: 202, quality: "720p HD", sizeLabel: "350 MB", url: `https://mega.nz/search/${encodeURIComponent(tmdbData.title)}+S01E0${num}`, provider: "Mega Fast Cloud" },
            ],
          })),
        },
      ];
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tmdbData,
        seasons,
      },
    });
  } catch (err: any) {
    console.error("Error fetching series details:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
