import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

interface ServerCandidate {
  id: string;
  name: string;
  tag: string;
  quality: string;
  color: string;
  provider: string;
  url: string;
  isCustom?: boolean;
}

/**
 * Fast network ping to test if a candidate server is alive and responding
 * - Considers 200, 3xx redirects, and 403 (Cloudflare browser challenges) as active
 * - Filters out 404 (Not Found), 500/502/503 (Crashed/Unavailable), DNS errors, and timeouts (>2.5s)
 */
async function checkServerAlive(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });

    if (res.status === 404 || res.status === 500 || res.status === 502 || res.status === 503) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

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
    const tmdbIdParam = searchParams.get("tmdbId") || searchParams.get("id") || "";
    const type = (searchParams.get("type") || "MOVIE").toUpperCase();
    const season = Math.max(1, parseInt(searchParams.get("season") || "1", 10));
    const episode = Math.max(1, parseInt(searchParams.get("episode") || "1", 10));
    const slug = searchParams.get("slug") || "";

    const cleanTmdbId = tmdbIdParam.trim();
    if (!cleanTmdbId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'tmdbId' query parameter." },
        { status: 400 }
      );
    }

    const isSeries = type === "SERIES";

    // 1. Gather custom stream sources from local DB if available
    const customCandidates: ServerCandidate[] = [];
    try {
      let localMovie: any = null;
      if (slug) {
        localMovie = await db.movie.findFirst({
          where: { OR: [{ slug }, { tmdbId: cleanTmdbId }] },
          include: {
            streamSources: { orderBy: { sortOrder: "asc" } },
            seasons: {
              where: { seasonNumber: season },
              include: {
                episodes: {
                  where: { episodeNumber: episode },
                  include: { streamSources: { orderBy: { sortOrder: "asc" } } },
                },
              },
            },
          },
        });
      }

      if (localMovie) {
        if (isSeries) {
          const epSources = localMovie.seasons?.[0]?.episodes?.[0]?.streamSources || [];
          epSources.forEach((cs: any, idx: number) => {
            if (cs.url) {
              customCandidates.push({
                id: `custom_ep_${cs.id || idx}`,
                name: cs.serverName || `Server ${idx + 1} (VIP)`,
                tag: cs.quality || "Ultra HD",
                quality: cs.quality || "1080p",
                color: "#22c55e",
                provider: "custom_db",
                url: cs.url,
                isCustom: true,
              });
            }
          });
        } else {
          const movieSources = localMovie.streamSources || [];
          movieSources.forEach((cs: any, idx: number) => {
            if (cs.url) {
              customCandidates.push({
                id: `custom_mv_${cs.id || idx}`,
                name: cs.serverName || `Server ${idx + 1} (VIP)`,
                tag: cs.quality || "Ultra HD",
                quality: cs.quality || "1080p",
                color: "#22c55e",
                provider: "custom_db",
                url: cs.url,
                isCustom: true,
              });
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn("[Watch Servers API] Local DB stream sources lookup error:", dbErr);
    }

    // 2. Define standard global multi-provider candidates
    const globalCandidates: ServerCandidate[] = isSeries
      ? [
          {
            id: "server-1",
            name: "Server 1",
            tag: "Ultra HD • Fast",
            quality: "4K / 1080p",
            color: "#22c55e",
            provider: "vidcore",
            url: `https://vidcore.net/tv/${cleanTmdbId}/${season}/${episode}?autoPlay=true&theme=E50914&title=true&poster=true&nextButton=true&autoNext=true`,
          },
          {
            id: "server-2",
            name: "Server 2",
            tag: "Dual Audio • Multi",
            quality: "1080p",
            color: "#3b82f6",
            provider: "vidsrcpro",
            url: `https://vidsrc.pro/embed/tv/${cleanTmdbId}/${season}/${episode}`,
          },
          {
            id: "server-3",
            name: "Server 3",
            tag: "Full HD • Fast",
            quality: "1080p / 720p",
            color: "#a855f7",
            provider: "embedflix",
            url: `https://embedflix.in/embed/tv/${cleanTmdbId}/${season}/${episode}`,
          },
          {
            id: "server-4",
            name: "Server 4",
            tag: "Multi-Sub • 1080p",
            quality: "1080p",
            color: "#ec4899",
            provider: "vidlink",
            url: `https://vidlink.pro/tv/${cleanTmdbId}/${season}/${episode}`,
          },
          {
            id: "server-5",
            name: "Server 5",
            tag: "Auto Fallback • VIP",
            quality: "HD Auto",
            color: "#e50914",
            provider: "multiembed",
            url: `https://multiembed.mov/?video_id=${cleanTmdbId}&tmdb=1&s=${season}&e=${episode}`,
          },
        ]
      : [
          {
            id: "server-1",
            name: "Server 1",
            tag: "Ultra HD • Fast",
            quality: "4K / 1080p",
            color: "#22c55e",
            provider: "vidcore",
            url: `https://vidcore.net/movie/${cleanTmdbId}?autoPlay=true&theme=E50914&title=true&poster=true`,
          },
          {
            id: "server-2",
            name: "Server 2",
            tag: "Dual Audio • Multi",
            quality: "1080p",
            color: "#3b82f6",
            provider: "vidsrcpro",
            url: `https://vidsrc.pro/embed/movie/${cleanTmdbId}`,
          },
          {
            id: "server-3",
            name: "Server 3",
            tag: "Full HD • Fast",
            quality: "1080p / 720p",
            color: "#a855f7",
            provider: "embedflix",
            url: `https://embedflix.in/embed/movie/${cleanTmdbId}`,
          },
          {
            id: "server-4",
            name: "Server 4",
            tag: "Multi-Sub • 1080p",
            quality: "1080p",
            color: "#ec4899",
            provider: "vidlink",
            url: `https://vidlink.pro/movie/${cleanTmdbId}`,
          },
          {
            id: "server-5",
            name: "Server 5",
            tag: "Auto Fallback • VIP",
            quality: "HD Auto",
            color: "#e50914",
            provider: "multiembed",
            url: `https://multiembed.mov/?video_id=${cleanTmdbId}&tmdb=1`,
          },
        ];

    const allCandidates = [...customCandidates, ...globalCandidates];

    // 3. Fast parallel health verification: filter to ONLY working servers
    const verificationResults = await Promise.allSettled(
      allCandidates.map(async (candidate) => {
        const isAlive = await checkServerAlive(candidate.url);
        return { candidate, isAlive };
      })
    );

    const workingServers: ServerCandidate[] = [];
    verificationResults.forEach((res) => {
      if (res.status === "fulfilled" && res.value.isAlive) {
        workingServers.push(res.value.candidate);
      }
    });

    // In the rare scenario that strict pings timed out simultaneously due to local host network restrictions,
    // ensure at least reliable fallback servers are provided so playback is never blocked unnecessarily
    const finalServers = workingServers.length > 0 ? workingServers : globalCandidates.slice(0, 3);

    // 4. Fetch same-category fallback recommendations if no servers or for "Watch Other"
    let categoryRecommendations: any[] = [];
    try {
      categoryRecommendations = await db.movie.findMany({
        where: {
          status: "PUBLISHED",
          ...(slug ? { slug: { not: slug } } : {}),
          ...(isSeries ? { type: "SERIES" } : { type: "MOVIE" }),
        },
        orderBy: [{ imdbRating: "desc" }, { viewCount: "desc" }],
        take: 8,
        include: {
          genres: { include: { genre: true } },
        },
      });
    } catch {
      // Non-fatal fallback
    }

    return NextResponse.json({
      success: true,
      tmdbId: cleanTmdbId,
      type,
      season: isSeries ? season : undefined,
      episode: isSeries ? episode : undefined,
      totalChecked: allCandidates.length,
      workingCount: finalServers.length,
      hasWorkingServers: finalServers.length > 0,
      servers: finalServers.map((s, idx) => ({
        ...s,
        // Ensure clean standardized numbering if needed
        name: s.isCustom ? s.name : `Server ${idx + 1}`,
      })),
      categoryRecommendations,
    });
  } catch (err: any) {
    console.error("[Watch Servers API Error]:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
