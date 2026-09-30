import { NextRequest, NextResponse } from "next/server";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import { getAnimeCatalog } from "@/lib/tmdb";

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
    const category = searchParams.get("category") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const items = await getAnimeCatalog(category, page);

    // Strictly ensure adult items are NEVER returned
    const safeItems = items.filter((item: any) => !item.adult && !item.isAdult);

    return NextResponse.json({
      success: true,
      data: safeItems,
      category,
      pagination: {
        page,
        totalPages: 50,
        hasMore: safeItems.length > 0,
      },
    });
  } catch (error: any) {
    console.error("Anime route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch anime catalog" },
      { status: 500 }
    );
  }
}
