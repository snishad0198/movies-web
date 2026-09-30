import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalMovies,
      totalSeries,
      totalComments,
      totalDownloads,
      viewsTodayCount,
      recentViews,
      topViewed,
      topDownloaded,
      recentSearches,
    ] = await Promise.all([
      db.movie.count({ where: { type: "MOVIE" } }),
      db.movie.count({ where: { type: "SERIES" } }),
      db.comment.count(),
      db.activityLog.count({ where: { type: "DOWNLOAD_CLICK" } }),
      db.activityLog.count({ where: { type: "VIEW", createdAt: { gte: today } } }),
      // Last 7 days views for chart
      db.activityLog.findMany({
        where: {
          type: "VIEW",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
      }),
      // Top 10 most viewed
      db.movie.findMany({
        take: 10,
        orderBy: { viewCount: "desc" },
        select: { id: true, title: true, type: true, releaseYear: true, viewCount: true, downloadCount: true },
      }),
      // Top 10 most downloaded
      db.movie.findMany({
        take: 10,
        orderBy: { downloadCount: "desc" },
        select: { id: true, title: true, type: true, releaseYear: true, downloadCount: true, viewCount: true },
      }),
      // Popular search terms
      db.activityLog.findMany({
        where: { type: "SEARCH" },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { value: true, createdAt: true },
      }),
    ]);

    // Group last 7 days by day of week
    const chartData: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      chartData[label] = 0;
    }

    recentViews.forEach((v) => {
      const label = new Date(v.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      if (chartData[label] !== undefined) {
        chartData[label] += 1;
      }
    });

    const viewsChart = Object.entries(chartData).map(([date, views]) => ({ date, views }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalMovies,
          totalSeries,
          totalComments,
          totalDownloads,
          viewsToday: viewsTodayCount,
        },
        viewsChart,
        topViewed,
        topDownloaded,
        recentSearches,
      },
    });
  } catch (err: any) {
    console.error("Admin analytics error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
