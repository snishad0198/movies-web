import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateSettingsCache } from "@/lib/settings";
import { invalidateTmdbKeyCache } from "@/lib/tmdb";
import { logActivity } from "@/lib/analytics";
import { getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await db.siteSetting.findUnique({
      where: { id: "1" },
    });
    return NextResponse.json({ success: true, data: settings });
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

    const updated = await (db.siteSetting as any).upsert({
      where: { id: "1" },
      update: {
        siteName: body.siteName,
        tagline: body.tagline,
        logo: body.logo,
        favicon: body.favicon,
        gaId: body.gaId,
        adsenseId: body.adsenseId,
        adsEnabled: body.adsEnabled !== undefined ? Boolean(body.adsEnabled) : undefined,
        maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : undefined,
        maintenanceMsg: body.maintenanceMsg,
        maxLoginAttempts: body.maxLoginAttempts ? parseInt(String(body.maxLoginAttempts), 10) : undefined,
        lockoutDuration: body.lockoutDuration ? parseInt(String(body.lockoutDuration), 10) : undefined,
        recaptchaEnabled: body.recaptchaEnabled !== undefined ? Boolean(body.recaptchaEnabled) : undefined,
        recaptchaSiteKey: body.recaptchaSiteKey,
        recaptchaSecret: body.recaptchaSecret,
        smtpHost: body.smtpHost,
        smtpPort: body.smtpPort ? parseInt(String(body.smtpPort), 10) : undefined,
        smtpUser: body.smtpUser,
        smtpPass: body.smtpPass,
        smtpFromName: body.smtpFromName,
        smtpFromEmail: body.smtpFromEmail,
        socialFacebook: body.socialFacebook,
        socialInstagram: body.socialInstagram,
        socialTwitter: body.socialTwitter,
        socialYoutube: body.socialYoutube,
        socialTelegram: body.socialTelegram,
        socialWhatsapp: body.socialWhatsapp,
        playerType: body.playerType,
        autoplay: body.autoplay !== undefined ? Boolean(body.autoplay) : undefined,
        watermark: body.watermark,
        downloadApiUrl: body.downloadApiUrl,
        tmdbApiKey: body.tmdbApiKey !== undefined ? (body.tmdbApiKey ? String(body.tmdbApiKey).trim() : null) : undefined,
        footerText: body.footerText,
        itemsPerPage: body.itemsPerPage ? parseInt(String(body.itemsPerPage), 10) : undefined,
        adHeader: body.adHeader,
        adAfterHero: body.adAfterHero,
        adSidebar: body.adSidebar,
        adInContent: body.adInContent,
        adBeforePlayer: body.adBeforePlayer,
        adFooter: body.adFooter,

        // Customizer & Appearance
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        backgroundColor: body.backgroundColor,
        cardColor: body.cardColor,
        textColor: body.textColor,

        // Text, Link & Layout Customizer
        announcementText: body.announcementText,
        announcementLink: body.announcementLink,
        announcementActive: body.announcementActive !== undefined ? Boolean(body.announcementActive) : undefined,
        customLinks: body.customLinks,
        layoutStyle: body.layoutStyle,
      },
      create: {
        id: "1",
        ...body,
      },
    });

    invalidateSettingsCache();
    invalidateTmdbKeyCache();

    logActivity("ADMIN_ACTION", {
      value: "Site settings updated",
      ip: getClientIp(req),
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("Admin settings PUT error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
