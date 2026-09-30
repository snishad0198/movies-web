import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, newEmail } = await req.json();

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is required to make changes" },
        { status: 400 }
      );
    }

    const admin = await db.admin.findUnique({
      where: { id: session.id },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin account not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }

    const updateData: any = {};

    if (newEmail && newEmail.trim() !== admin.email) {
      const emailExists = await db.admin.findUnique({
        where: { email: newEmail.trim().toLowerCase() },
      });
      if (emailExists && emailExists.id !== admin.id) {
        return NextResponse.json(
          { success: false, error: "Email address is already in use by another admin" },
          { status: 400 }
        );
      }
      updateData.email = newEmail.trim().toLowerCase();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: "No changes requested" });
    }

    await db.admin.update({
      where: { id: session.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully",
      updatedEmail: updateData.email || admin.email,
    });
  } catch (err: any) {
    console.error("Admin password change error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
