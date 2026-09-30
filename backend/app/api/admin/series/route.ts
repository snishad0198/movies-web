import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { logActivity } from "@/lib/analytics";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const where: any = { type: "SERIES" };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tmdbId: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      db.movie.count({ where }),
      db.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seasons: {
            include: {
              episodes: true,
            },
          },
          genres: {
            include: { genre: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map((s) => ({
        ...s,
        imdbRating: s.imdbRating ? Number(s.imdbRating) : null,
        genres: s.genres.map((g) => g.genre),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Admin series GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch series" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      slug: customSlug,
      description,
      poster,
      backdrop,
      trailerUrl,
      releaseYear,
      language,
      imdbRating,
      imdbId,
      tmdbId,
      director,
      cast,
      production,
      country,
      status,
      featured,
      genreIds = [],
      seasons = [],
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    let finalSlug = customSlug ? slugify(customSlug) : slugify(title);
    const slugExists = await db.movie.findUnique({ where: { slug: finalSlug } });
    if (slugExists) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const series = await db.movie.create({
      data: {
        title,
        slug: finalSlug,
        type: "SERIES",
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: releaseYear ? parseInt(String(releaseYear), 10) : undefined,
        language: language || "Hindi",
        imdbRating: imdbRating ? parseFloat(String(imdbRating)) : undefined,
        imdbId,
        tmdbId: tmdbId ? String(tmdbId) : undefined,
        director,
        cast: cast || [],
        production,
        country: country || "India",
        status: status || "PUBLISHED",
        featured: Boolean(featured),
        genres: {
          create: genreIds.map((id: number) => ({
            genreId: id,
          })),
        },
        seasons: {
          create: seasons.map((season: any) => ({
            seasonNumber: season.seasonNumber || 1,
            title: season.title || `Season ${season.seasonNumber || 1}`,
            year: season.year,
            poster: season.poster,
            episodes: {
              create: (season.episodes || []).map((ep: any) => ({
                episodeNumber: ep.episodeNumber,
                title: ep.title || `Episode ${ep.episodeNumber}`,
                description: ep.description,
                thumbnail: ep.thumbnail,
                duration: ep.duration,
                airDate: ep.airDate,
                streamSources: {
                  create: (ep.streamSources || []).map((st: any, idx: number) => ({
                    serverName: st.serverName || `Server ${idx + 1}`,
                    url: st.url,
                    type: st.type || "EMBED",
                    quality: st.quality || "1080p",
                    sortOrder: idx,
                  })),
                },
                downloadLinks: {
                  create: (ep.downloadLinks || []).map((dl: any, idx: number) => ({
                    quality: dl.quality || "720p",
                    sizeLabel: dl.sizeLabel,
                    url: dl.url,
                    sortOrder: idx,
                  })),
                },
              })),
            },
          })),
        },
      },
    });

    logActivity("ADMIN_ACTION", {
      referenceId: series.id,
      referenceType: "SERIES",
      value: `Created web series: ${series.title}`,
      ip: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({ success: true, data: series });
  } catch (err: any) {
    console.error("Admin series POST error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create series" }, { status: 500 });
  }
}
