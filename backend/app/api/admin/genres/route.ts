import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const genres = await db.genre.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { movies: true } },
      },
    });

    return NextResponse.json({ success: true, data: genres });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, color, icon, description, sortOrder, showOnHomepage } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const genre = await db.genre.create({
      data: {
        name,
        slug: slugify(name),
        color: color || "#e50914",
        icon,
        description,
        sortOrder: sortOrder ? parseInt(String(sortOrder), 10) : 0,
        showOnHomepage: showOnHomepage !== undefined ? Boolean(showOnHomepage) : true,
      },
    });

    return NextResponse.json({ success: true, data: genre });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, color, icon, description, sortOrder, showOnHomepage } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing genre ID" }, { status: 400 });
    }

    const genre = await db.genre.update({
      where: { id: parseInt(String(id), 10) },
      data: {
        name,
        slug: name ? slugify(name) : undefined,
        color,
        icon,
        description,
        sortOrder: sortOrder ? parseInt(String(sortOrder), 10) : undefined,
        showOnHomepage: showOnHomepage !== undefined ? Boolean(showOnHomepage) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: genre });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });

    await db.genre.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true, message: "Genre deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
