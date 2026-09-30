import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { getTrendingByRegion } from "@/lib/tmdb";
import { detectUserCountry } from "@/lib/geo";

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
    const userRegion = detectUserCountry(req);
    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(10, parseInt(url.searchParams.get("limit") || "60", 10)));

    // Fetch up to 5 pages in parallel to deliver a deep, comprehensive trending catalog (80-100+ items)
    const [page1, page2, page3, page4, page5, dbItems] = await Promise.all([
      getTrendingByRegion(userRegion.code, 1),
      getTrendingByRegion(userRegion.code, 2),
      getTrendingByRegion(userRegion.code, 3),
      getTrendingByRegion(userRegion.code, 4),
      getTrendingByRegion(userRegion.code, 5),
      db.movie
        .findMany({
          where: { status: "PUBLISHED", featured: true },
          include: { genres: { include: { genre: true } } },
        })
        .catch(() => []),
    ]);

    const formattedDb = dbItems.map((m: any) => ({
      ...m,
      imdbRating: m.imdbRating ? Number(m.imdbRating) : null,
      genres: m.genres ? m.genres.map((g: any) => g.genre) : [],
    }));

    const isIndia = userRegion.code === "IN";
    const rawList = isIndia
      ? [...formattedDb, ...page1, ...page2, ...page3, ...page4, ...page5]
      : [...page1, ...page2, ...page3, ...page4, ...page5];

    // De-duplicate by TMDB ID / title
    const seen = new Set<string>();
    const deduplicated: any[] = [];
    for (const item of rawList) {
      if (item.adult || item.isAdult) continue;
      const key = `${item.title.toLowerCase().trim()}-${item.releaseYear || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    const combined = deduplicated.slice(0, limit).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      region: {
        code: userRegion.code,
        name: userRegion.name,
      },
      count: combined.length,
      updatedAt: new Date().toISOString(),
      data: combined,
    });
  } catch (err: any) {
    console.error("Error fetching trending by region:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
