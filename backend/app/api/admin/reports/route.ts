import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "errors"; // errors, downloads, activity

    if (type === "errors") {
      const logs = await db.errorLog.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: logs });
    }

    if (type === "downloads") {
      const logs = await db.activityLog.findMany({
        where: { type: "DOWNLOAD_CLICK" },
        take: 100,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: logs });
    }

    const logs = await db.activityLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
