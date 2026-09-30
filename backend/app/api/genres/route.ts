import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";

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
    const genres = await db.genre.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { movies: true },
        },
      },
    });

    const formatted = genres.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      color: g.color,
      icon: g.icon,
      description: g.description,
      showOnHomepage: g.showOnHomepage,
      moviesCount: g._count.movies,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    console.error("Genres API error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
