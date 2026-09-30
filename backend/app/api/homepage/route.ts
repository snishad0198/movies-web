import { NextRequest, NextResponse } from "next/server";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { getCategoryItems, getTrendingByRegion } from "@/lib/tmdb";
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
    // 1. Detect visitor's country / region dynamically
    const userRegion = detectUserCountry(req);
    const regionCode = userRegion?.code || "IN";
    const regionName = userRegion?.name || "India";

    // 2. Fetch live TMDB feeds mirroring categories with dynamic region trending
    const [
      trending,
      indianNew,
      indianSeries,
      southAll,
      hollywood,
      holywoodSeries,
      classicOld,
      anime,
      upcoming,
    ] = await Promise.all([
      getTrendingByRegion(regionCode, 1),
      getCategoryItems("indian_new"),
      getCategoryItems("indian_series"),
      getCategoryItems("south_all"),
      getCategoryItems("hollywood"),
      getCategoryItems("holywood_series"),
      getCategoryItems("classic_old"),
      getCategoryItems("anime"),
      getCategoryItems("upcoming"),
    ]);

    // Hero banner: Pick top 6 items with rich backdrop from trending TMDB
    const heroPool = trending.filter(
      (x: any) => x.backdrop && x.backdrop.startsWith("http")
    );
    const hero = heroPool.length > 0 ? heroPool.slice(0, 6) : trending.slice(0, 6);

    const trendingTitle =
      regionCode === "GLOBAL"
        ? "Top Trending Worldwide"
        : `Top Trending in ${regionName}`;

    // Note: "SNishad Exclusives" has been completely removed per user request
    const rows = [
      {
        title: trendingTitle,
        type: "trending",
        showRank: true,
        region: regionCode,
        regionName: regionName,
        viewAllHref: `/trending?region=${regionCode}`,
        items: trending,
      },
      {
        title: "New Indian Blockbusters (Bollywood)",
        type: "indian_new",
        showRank: false,
        viewAllHref: "/movies?category=bollywood",
        items: indianNew,
      },
      {
        title: "Top Indian Web Series",
        type: "indian_series",
        showRank: false,
        viewAllHref: "/series?category=indian",
        items: indianSeries,
      },
      {
        title: "South Indian Action Cinema",
        type: "south_all",
        showRank: false,
        viewAllHref: "/movies?category=south",
        items: southAll,
      },
      {
        title: "Hollywood Blockbusters",
        type: "hollywood",
        showRank: false,
        viewAllHref: "/movies?category=hollywood",
        items: hollywood,
      },
      {
        title: "Global English Web Series",
        type: "holywood_series",
        showRank: false,
        viewAllHref: "/series?category=hollywood",
        items: holywoodSeries,
      },
      {
        title: "Classic & Vintage Cinema",
        type: "classic_old",
        showRank: false,
        viewAllHref: "/movies?category=old",
        items: classicOld,
      },
      {
        title: "Anime Universe",
        type: "anime",
        showRank: false,
        viewAllHref: "/anime",
        items: anime,
      },
      {
        title: "Upcoming 2026 Hits",
        type: "upcoming",
        showRank: false,
        viewAllHref: "/new",
        items: upcoming,
      },
    ];

    const cleanRows = rows.map((r) => ({
      ...r,
      items: (r.items || []).filter((m: any) => !m.adult && !m.isAdult),
    }));

    const cleanHero = (hero || []).filter((m: any) => !m.adult && !m.isAdult);

    return NextResponse.json({
      success: true,
      data: {
        userRegion: {
          code: regionCode,
          name: regionName,
        },
        hero: cleanHero,
        rows: cleanRows,
      },
    });
  } catch (err: any) {
    console.error("Error building live homepage feed:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
