import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/analytics";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, episodeId, title } = body;
    const ip = getClientIp(req);

    if (movieId) {
      await db.movie.update({
        where: { id: parseInt(String(movieId), 10) },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
    }

    if (episodeId) {
      await db.seriesEpisode.update({
        where: { id: parseInt(String(episodeId), 10) },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
    }

    await logActivity("VIEW", {
      referenceId: movieId || episodeId,
      referenceType: episodeId ? "EPISODE" : "MOVIE",
      value: title || "Stream View",
      ip,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Track view error:", err);
    return NextResponse.json({ success: false, error: "Tracking failed" }, { status: 500 });
  }
}
