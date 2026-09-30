import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiAccess, checkRateLimit, getClientIp } from "@/lib/security";
import DOMPurify from "isomorphic-dompurify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const movieIdStr = searchParams.get("movieId");

  if (!movieIdStr) {
    return NextResponse.json({ success: false, error: "Missing movieId" }, { status: 400 });
  }

  const movieId = parseInt(movieIdStr, 10);
  try {
    const comments = await db.comment.findMany({
      where: {
        movieId,
        status: "APPROVED",
        parentId: null, // top-level comments
      },
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (err: any) {
    console.error("Comments GET error:", err);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 10, 60000)) {
    return NextResponse.json({ success: false, error: "Too many comments submitted. Please wait a minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { movieId, name, content, parentId, email } = body;

    if (!movieId || !name || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const cleanName = DOMPurify.sanitize(name.trim()).substring(0, 50);
    const cleanContent = DOMPurify.sanitize(content.trim()).substring(0, 1000);

    const comment = await db.comment.create({
      data: {
        movieId: parseInt(String(movieId), 10),
        name: cleanName,
        email: email ? String(email).trim().substring(0, 100) : undefined,
        content: cleanContent,
        parentId: parentId ? parseInt(String(parentId), 10) : undefined,
        ipAddress: ip,
        status: "APPROVED",
      },
    });

    return NextResponse.json({ success: true, data: comment });
  } catch (err: any) {
    console.error("Comment POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to post comment" }, { status: 500 });
  }
}
