import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "./auth";

// In-Memory Rate Limiter & Lockout Map
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const lockoutMap = new Map<string, LockoutRecord>();

export function getClientIp(req: Request | NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Anti-leeching / Closed API Access Verification.
 * Only allows requests from:
 * 1. Valid INTERNAL_API_KEY header (x-api-key)
 * 2. Allowed Origin/Referer headers matching frontend URLs
 * 3. Logged in Admin session
 */
export async function verifyApiAccess(req: Request | NextRequest): Promise<{ authorized: boolean; reason?: string }> {
  // 1. Check API Key header
  const apiKey = req.headers.get("x-api-key");
  const internalKey = process.env.INTERNAL_API_KEY || "movies-snishad-secure-internal-token-2026";
  if (apiKey && apiKey === internalKey) {
    return { authorized: true };
  }

  // 2. Check Allowed Origins & Referers
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  const host = req.headers.get("host") || "";
  const forwardedHost = req.headers.get("x-forwarded-host") || "";
  const clientIp = getClientIp(req);

  // Auto-allow local loopback & server-to-server Next.js rewrites
  if (
    clientIp === "127.0.0.1" ||
    clientIp === "::1" ||
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    forwardedHost.includes("localhost") ||
    forwardedHost.includes("127.0.0.1")
  ) {
    return { authorized: true };
  }

  const allowed = (process.env.ALLOWED_FRONTEND_ORIGINS || "http://localhost:3000,http://localhost:3001,https://moviessnishad.com")
    .split(",")
    .map((o) => o.trim().toLowerCase());

  const isOriginAllowed = allowed.some((a) => origin.toLowerCase().startsWith(a));
  const isRefererAllowed = allowed.some((a) => referer.toLowerCase().startsWith(a));

  if (isOriginAllowed || isRefererAllowed) {
    return { authorized: true };
  }

  // 3. Check for Admin Cookie
  const cookieHeader = req.headers.get("cookie") || "";
  const adminCookieMatch = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
  if (adminCookieMatch && adminCookieMatch[1]) {
    const admin = await verifyAdminToken(adminCookieMatch[1]);
    if (admin) {
      return { authorized: true };
    }
  }

  return {
    authorized: false,
    reason: "Direct API access forbidden. This backend is proprietary and closed-source.",
  };
}

/**
 * Standard Rate Limiter
 */
export function checkRateLimit(ip: string, maxRequests = 100, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Admin Login Brute-Force Lockout
 */
export function isIpLockedOut(ip: string): { locked: boolean; remainingMinutes?: number } {
  const now = Date.now();
  const record = lockoutMap.get(ip);
  if (!record) return { locked: false };

  if (record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { locked: true, remainingMinutes };
  }

  // If lockout period expired, reset failed attempts
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    lockoutMap.delete(ip);
  }

  return { locked: false };
}

export function recordFailedLogin(ip: string, maxAttempts = 5, lockoutDurationMin = 15): { lockedNow: boolean; attemptsLeft: number } {
  const now = Date.now();
  const record = lockoutMap.get(ip) || { failedAttempts: 0, lockedUntil: 0 };

  record.failedAttempts += 1;

  if (record.failedAttempts >= maxAttempts) {
    record.lockedUntil = now + lockoutDurationMin * 60 * 1000;
    lockoutMap.set(ip, record);
    return { lockedNow: true, attemptsLeft: 0 };
  }

  lockoutMap.set(ip, record);
  return { lockedNow: false, attemptsLeft: maxAttempts - record.failedAttempts };
}

export function clearFailedLogin(ip: string): void {
  lockoutMap.delete(ip);
}
