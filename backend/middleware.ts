import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "movies-snishad-super-secret-jwt-key-min-32-chars-2026";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
const ADMIN_COOKIE_NAME = "sn_admin_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization",
      },
    });
  }

  // 1. Allow login pages and public static assets
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Protect Admin UI Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (!payload || !payload.id) {
        throw new Error("Invalid payload");
      }
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }
  }

  // 3. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    const token =
      request.cookies.get(ADMIN_COOKIE_NAME)?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials required." },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (!payload || !payload.id) {
        throw new Error("Invalid payload");
      }
      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired admin session token." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
