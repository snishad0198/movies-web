import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { logActivity } from "@/lib/analytics";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

// Utility to generate URL-safe slugs
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
    const status = searchParams.get("status");
    const genre = searchParams.get("genre");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const where: any = { type: "MOVIE" };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tmdbId: { contains: search } },
        { director: { contains: search } },
      ];
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (genre && genre !== "ALL") {
      where.genres = {
        some: {
          genre: { slug: genre },
        },
      };
    }

    const [total, items] = await Promise.all([
      db.movie.count({ where }),
      db.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          genres: {
            include: { genre: true },
          },
          streamSources: true,
          downloadLinks: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items.map((m) => ({
        ...m,
        imdbRating: m.imdbRating ? Number(m.imdbRating) : null,
        genres: m.genres.map((g) => g.genre),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Admin movies GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch movies" }, { status: 500 });
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
      runtime,
      language,
      imdbRating,
      imdbId,
      tmdbId,
      director,
      cast,
      production,
      country,
      screenshots,
      status,
      featured,
      tags,
      seoTitle,
      seoDescription,
      seoKeywords,
      genreIds = [],
      streamSources = [],
      downloadLinks = [],
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    let finalSlug = customSlug ? slugify(customSlug) : slugify(title);
    if (releaseYear) {
      const slugExists = await db.movie.findUnique({ where: { slug: finalSlug } });
      if (slugExists) {
        finalSlug = `${finalSlug}-${releaseYear}-${Date.now().toString().slice(-4)}`;
      }
    }

    const movie = await db.movie.create({
      data: {
        title,
        slug: finalSlug,
        type: "MOVIE",
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: releaseYear ? parseInt(String(releaseYear), 10) : undefined,
        runtime: runtime ? parseInt(String(runtime), 10) : undefined,
        language: language || "Hindi",
        imdbRating: imdbRating ? parseFloat(String(imdbRating)) : undefined,
        imdbId,
        tmdbId: tmdbId ? String(tmdbId) : undefined,
        director,
        cast: cast || [],
        production,
        country: country || "India",
        screenshots: screenshots || [],
        status: status || "PUBLISHED",
        featured: Boolean(featured),
        tags,
        seoTitle,
        seoDescription,
        seoKeywords,
        genres: {
          create: genreIds.map((id: number) => ({
            genreId: id,
          })),
        },
        streamSources: {
          create: streamSources.map((s: any, idx: number) => ({
            serverName: s.serverName || `Server ${idx + 1}`,
            url: s.url,
            type: s.type || "EMBED",
            quality: s.quality || "1080p",
            language: s.language || "Hindi",
            sortOrder: idx,
          })),
        },
        downloadLinks: {
          create: downloadLinks.map((d: any, idx: number) => ({
            quality: d.quality || "1080p",
            sizeLabel: d.sizeLabel,
            url: d.url,
            provider: d.provider || "Direct",
            sortOrder: idx,
          })),
        },
      },
    });

    logActivity("ADMIN_ACTION", {
      referenceId: movie.id,
      referenceType: "MOVIE",
      value: `Created movie: ${movie.title}`,
      ip: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({ success: true, data: movie });
  } catch (err: any) {
    console.error("Admin movie POST error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create movie" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, genreIds, streamSources, downloadLinks, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing movie ID" }, { status: 400 });
    }

    const movieId = parseInt(String(id), 10);

    // Update main movie fields
    await db.movie.update({
      where: { id: movieId },
      data: {
        title: fields.title,
        slug: fields.slug ? slugify(fields.slug) : undefined,
        description: fields.description,
        poster: fields.poster,
        backdrop: fields.backdrop,
        trailerUrl: fields.trailerUrl,
        releaseYear: fields.releaseYear ? parseInt(String(fields.releaseYear), 10) : undefined,
        runtime: fields.runtime ? parseInt(String(fields.runtime), 10) : undefined,
        language: fields.language,
        imdbRating: fields.imdbRating ? parseFloat(String(fields.imdbRating)) : undefined,
        imdbId: fields.imdbId,
        tmdbId: fields.tmdbId ? String(fields.tmdbId) : undefined,
        director: fields.director,
        cast: fields.cast,
        production: fields.production,
        country: fields.country,
        screenshots: fields.screenshots,
        status: fields.status,
        featured: fields.featured !== undefined ? Boolean(fields.featured) : undefined,
        tags: fields.tags,
        seoTitle: fields.seoTitle,
        seoDescription: fields.seoDescription,
        seoKeywords: fields.seoKeywords,
      },
    });

    // Update genres if provided
    if (Array.isArray(genreIds)) {
      await db.movieGenre.deleteMany({ where: { movieId } });
      if (genreIds.length > 0) {
        await db.movieGenre.createMany({
          data: genreIds.map((gId: number) => ({
            movieId,
            genreId: gId,
          })),
        });
      }
    }

    // Update stream sources if provided
    if (Array.isArray(streamSources)) {
      await db.streamSource.deleteMany({ where: { movieId } });
      if (streamSources.length > 0) {
        await db.streamSource.createMany({
          data: streamSources.map((s: any, idx: number) => ({
            movieId,
            serverName: s.serverName || `Server ${idx + 1}`,
            url: s.url,
            type: s.type || "EMBED",
            quality: s.quality || "1080p",
            language: s.language || "Hindi",
            sortOrder: idx,
          })),
        });
      }
    }

    // Update download links if provided
    if (Array.isArray(downloadLinks)) {
      await db.downloadLink.deleteMany({ where: { movieId } });
      if (downloadLinks.length > 0) {
        await db.downloadLink.createMany({
          data: downloadLinks.map((d: any, idx: number) => ({
            movieId,
            quality: d.quality || "1080p",
            sizeLabel: d.sizeLabel,
            url: d.url,
            provider: d.provider || "Direct",
            sortOrder: idx,
          })),
        });
      }
    }

    logActivity("ADMIN_ACTION", {
      referenceId: movieId,
      referenceType: "MOVIE",
      value: `Updated movie ID ${movieId}`,
      ip: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Movie updated successfully" });
  } catch (err: any) {
    console.error("Admin movie PUT error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to update movie" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const movieId = parseInt(id, 10);
    await db.movie.delete({ where: { id: movieId } });

    logActivity("ADMIN_ACTION", {
      referenceId: movieId,
      referenceType: "MOVIE",
      value: `Deleted movie ID ${movieId}`,
      ip: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({ success: true, message: "Movie deleted successfully" });
  } catch (err: any) {
    console.error("Admin movie DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete movie" }, { status: 500 });
  }
}
