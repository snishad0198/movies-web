import { NextRequest, NextResponse } from "next/server";
import { fetchDownloadLinks } from "@/lib/download-api";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 60)) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  const access = await verifyApiAccess(req);
  if (!access.authorized) {
    return NextResponse.json({ success: false, error: access.reason }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const year = searchParams.get("year") || undefined;
    const movieIdStr = searchParams.get("movieId");
    const episodeIdStr = searchParams.get("episodeId");

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Missing required 'title' query parameter." },
        { status: 400 }
      );
    }

    const movieId = movieIdStr ? parseInt(movieIdStr, 10) : undefined;
    const episodeId = episodeIdStr ? parseInt(episodeIdStr, 10) : undefined;

    const links = await fetchDownloadLinks(title, year, movieId, episodeId);

    return NextResponse.json({
      success: true,
      data: links,
    });
  } catch (err: any) {
    console.error("Download proxy API error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
