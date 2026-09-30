import { db } from "./db";

export interface PublicSiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  footerText: string;
  gaId?: string;
  adsEnabled: boolean;
  adsenseId?: string;
  adHeader?: string;
  adAfterHero?: string;
  adSidebar?: string;
  adInContent?: string;
  adBeforePlayer?: string;
  adFooter?: string;
  socialFacebook?: string;
  socialInstagram: string;
  socialTwitter?: string;
  socialYoutube?: string;
  socialTelegram?: string;
  socialWhatsapp?: string;
  playerType: string;
  autoplay: boolean;
  watermark?: string;
  maintenanceMode: boolean;
  maintenanceMsg?: string;
  itemsPerPage: number;

  // Theme & Appearance Customizer
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;

  // Announcement & Layout Customizer
  announcementText?: string;
  announcementLink?: string;
  announcementActive: boolean;
  customLinks?: string;
  layoutStyle: string;

  // Creator & Hire Me Details (Requested for Public Open Source)
  creatorName: string;
  creatorInstagram: string;
  contactEmail: string;
  hireMeNotice: string;
  bugReportNotice: string;
}

const DEFAULT_SETTINGS: PublicSiteSettings = {
  siteName: "Movies.snishad",
  tagline: "Watch & Download Free HD Movies & Series",
  logo: "https://i.ibb.co/xKTs0n1x/18101784373776709.jpg",
  favicon: "https://i.ibb.co/xKTs0n1x/18101784373776709.jpg",
  footerText: "Movies.snishad is a premier open-source entertainment index. All media files are indexed from verified third-party cloud streaming servers.",
  adsEnabled: false,
  playerType: "plyr",
  autoplay: true,
  maintenanceMode: false,
  itemsPerPage: 20,
  primaryColor: "#e50914",
  accentColor: "#ff1f2d",
  backgroundColor: "#08080c",
  cardColor: "#121218",
  textColor: "#f8fafc",
  announcementText: "Welcome to Movies.snishad! Stream latest Bollywood, Hollywood, and South Indian cinema in HD.",
  announcementLink: "",
  announcementActive: false,
  customLinks: "[]",
  layoutStyle: "modern",

  // Creator & Contact Info
  socialInstagram: "https://instagram.com/snishad.me_",
  socialTelegram: "https://t.me/snishad",
  creatorName: "SNishad",
  creatorInstagram: "https://instagram.com/snishad.me_",
  contactEmail: "snishad01985@gmail.com",
  hireMeNotice: "Want to make your website at an affordable price? Connect with me on Instagram (@snishad.me_) or Email: snishad01985@gmail.com",
  bugReportNotice: "Found any bugs or issues? Please report them to me on Instagram (@snishad.me_). Contributions and feedback are welcome!",
};

let cachedSettings: PublicSiteSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  const now = Date.now();
  if (cachedSettings && now - lastFetchTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const row = await db.siteSetting.findUnique({
      where: { id: "1" },
    });

    if (row) {
      cachedSettings = {
        siteName: row.siteName || DEFAULT_SETTINGS.siteName,
        tagline: row.tagline || DEFAULT_SETTINGS.tagline,
        logo: row.logo || DEFAULT_SETTINGS.logo,
        favicon: row.favicon || DEFAULT_SETTINGS.favicon,
        footerText: row.footerText || DEFAULT_SETTINGS.footerText,
        gaId: row.gaId || undefined,
        adsEnabled: row.adsEnabled,
        adsenseId: row.adsenseId || undefined,
        adHeader: row.adHeader || undefined,
        adAfterHero: row.adAfterHero || undefined,
        adSidebar: row.adSidebar || undefined,
        adInContent: row.adInContent || undefined,
        adBeforePlayer: row.adBeforePlayer || undefined,
        adFooter: row.adFooter || undefined,
        socialFacebook: row.socialFacebook || undefined,
        socialInstagram: row.socialInstagram || "https://instagram.com/snishad.me_",
        socialTwitter: row.socialTwitter || undefined,
        socialYoutube: row.socialYoutube || undefined,
        socialTelegram: row.socialTelegram || "https://t.me/snishad",
        socialWhatsapp: row.socialWhatsapp || undefined,
        playerType: row.playerType || DEFAULT_SETTINGS.playerType,
        autoplay: row.autoplay,
        watermark: row.watermark || undefined,
        maintenanceMode: row.maintenanceMode,
        maintenanceMsg: row.maintenanceMsg || undefined,
        itemsPerPage: row.itemsPerPage || 20,

        primaryColor: (row as any).primaryColor || DEFAULT_SETTINGS.primaryColor,
        accentColor: (row as any).accentColor || DEFAULT_SETTINGS.accentColor,
        backgroundColor: (row as any).backgroundColor || DEFAULT_SETTINGS.backgroundColor,
        cardColor: (row as any).cardColor || DEFAULT_SETTINGS.cardColor,
        textColor: (row as any).textColor || DEFAULT_SETTINGS.textColor,

        announcementText: (row as any).announcementText || undefined,
        announcementLink: (row as any).announcementLink || undefined,
        announcementActive: Boolean((row as any).announcementActive),
        customLinks: (row as any).customLinks || DEFAULT_SETTINGS.customLinks,
        layoutStyle: (row as any).layoutStyle || DEFAULT_SETTINGS.layoutStyle,

        // Creator & Hire Me Details (Requested for Public Open Source)
        creatorName: "SNishad",
        creatorInstagram: "https://instagram.com/snishad.me_",
        contactEmail: "snishad01985@gmail.com",
        hireMeNotice: "Want to make your website at an affordable price? Connect with me on Instagram (@snishad.me_) or Email: snishad01985@gmail.com",
        bugReportNotice: "Found any bugs or issues? Please report them to me on Instagram (@snishad.me_). Contributions and reports are welcome!",
      };
      lastFetchTime = now;
      return cachedSettings;
    }
  } catch (e) {
    console.warn("Failed to read site settings from DB, using defaults:", e);
  }

  return DEFAULT_SETTINGS;
}

export function invalidateSettingsCache() {
  cachedSettings = null;
  lastFetchTime = 0;
}
