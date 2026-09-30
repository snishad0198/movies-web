import { db } from "./db";

export async function logActivity(
  type: "VIEW" | "DOWNLOAD_CLICK" | "SEARCH" | "COMMENT" | "ADMIN_ACTION",
  options: {
    referenceId?: string | number;
    referenceType?: string;
    value?: string;
    ip?: string;
    userAgent?: string;
  }
) {
  try {
    await db.activityLog.create({
      data: {
        type,
        referenceId: options.referenceId ? String(options.referenceId) : undefined,
        referenceType: options.referenceType,
        value: options.value,
        ip: options.ip,
        userAgent: options.userAgent,
      },
    });
  } catch (err) {
    console.error("Failed to record activity log:", err);
  }
}

export async function logError(
  type: string,
  message: string,
  options: {
    url?: string;
    stack?: string;
    ip?: string;
  } = {}
) {
  try {
    await db.errorLog.create({
      data: {
        type,
        message,
        url: options.url,
        stack: options.stack,
        ip: options.ip,
      },
    });
  } catch (err) {
    console.error("Failed to record error log:", err);
  }
}
