import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const API_KEY = process.env.BACKEND_API_KEY || "movies-snishad-secure-internal-token-2026";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

async function handleProxy(request: NextRequest, pathSegments: string[]) {
  try {
    const subpath = (pathSegments || []).join("/");
    const search = request.nextUrl.search;
    const targetUrl = `${BACKEND_URL}/api/${subpath}${search}`;

    const headers: Record<string, string> = {
      "x-api-key": API_KEY,
    };

    const cookie = request.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) headers["accept-language"] = acceptLang;

    const cfCountry = request.headers.get("cf-ipcountry");
    if (cfCountry) headers["cf-ipcountry"] = cfCountry;

    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;

    let body: any = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        body = await request.text();
        headers["content-type"] = request.headers.get("content-type") || "application/json";
      } catch {
        // no body
      }
    }

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[Proxy Error]:", error);
    return NextResponse.json(
      { success: false, error: "Proxy connection failed" },
      { status: 502 }
    );
  }
}
