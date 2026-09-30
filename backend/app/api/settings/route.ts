import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(req: NextRequest) {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(
      { success: true, data: settings },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Public settings GET error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

