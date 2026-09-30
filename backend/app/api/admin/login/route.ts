import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { isIpLockedOut, recordFailedLogin, clearFailedLogin, getClientIp } from "@/lib/security";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // 1. Check IP Lockout
  const lockout = isIpLockedOut(ip);
  if (lockout.locked) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed login attempts. IP locked out for ${lockout.remainingMinutes} more minutes.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await db.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      const lockStatus = recordFailedLogin(ip);
      return NextResponse.json(
        {
          success: false,
          error: lockStatus.lockedNow
            ? "Account locked out for 15 minutes due to 5 failed attempts."
            : `Invalid credentials. (${lockStatus.attemptsLeft} attempts remaining)`,
        },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      const lockStatus = recordFailedLogin(ip);
      return NextResponse.json(
        {
          success: false,
          error: lockStatus.lockedNow
            ? "Account locked out for 15 minutes due to 5 failed attempts."
            : `Invalid credentials. (${lockStatus.attemptsLeft} attempts remaining)`,
        },
        { status: 401 }
      );
    }

    // Login successful
    clearFailedLogin(ip);

    await db.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    logActivity("ADMIN_ACTION", {
      referenceId: admin.id,
      value: `Admin login successful: ${admin.email}`,
      ip,
    }).catch(() => {});

    const token = await signAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, error: "Authentication system failure" },
      { status: 500 }
    );
  }
}
