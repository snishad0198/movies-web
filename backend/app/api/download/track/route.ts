import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/analytics";
import { getClientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, quality, title } = body;
    const ip = getClientIp(req);

    if (movieId) {
      await db.movie.update({
        where: { id: parseInt(String(movieId), 10) },
        data: { downloadCount: { increment: 1 } },
      }).catch(() => {});
    }

    await logActivity("DOWNLOAD_CLICK", {
      referenceId: movieId,
      referenceType: "MOVIE",
      value: `Quality: ${quality || "Unknown"} | Title: ${title || "Unknown"}`,
      ip,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Track download error:", err);
    return NextResponse.json({ success: false, error: "Tracking failed" }, { status: 500 });
  }
}
