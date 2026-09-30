import { NextRequest } from "next/server";

export interface RegionInfo {
  code: string;
  name: string;
  languages?: string;
}

export const REGIONS: Record<string, RegionInfo> = {
  IN: { code: "IN", name: "India", languages: "hi|en|te|ta|ml|kn" },
  US: { code: "US", name: "United States", languages: "en" },
  GB: { code: "GB", name: "United Kingdom", languages: "en" },
  CA: { code: "CA", name: "Canada", languages: "en|fr" },
  AU: { code: "AU", name: "Australia", languages: "en" },
  AE: { code: "AE", name: "United Arab Emirates", languages: "ar|en|hi" },
  SA: { code: "SA", name: "Saudi Arabia", languages: "ar|en" },
  PK: { code: "PK", name: "Pakistan", languages: "ur|en|hi" },
  BD: { code: "BD", name: "Bangladesh", languages: "bn|en|hi" },
  NP: { code: "NP", name: "Nepal", languages: "ne|hi|en" },
  DE: { code: "DE", name: "Germany", languages: "de|en" },
  FR: { code: "FR", name: "France", languages: "fr|en" },
  JP: { code: "JP", name: "Japan", languages: "ja|en" },
  KR: { code: "KR", name: "South Korea", languages: "ko|en" },
  BR: { code: "BR", name: "Brazil", languages: "pt|en" },
  GLOBAL: { code: "GLOBAL", name: "Worldwide", languages: "en" },
};

const ALIASES: Record<string, string> = {
  INDIA: "IN",
  HINDUSTAN: "IN",
  BHARAT: "IN",
  USA: "US",
  UNITEDSTATES: "US",
  AMERICA: "US",
  UK: "GB",
  UNITEDKINGDOM: "GB",
  ENGLAND: "GB",
  BRITAIN: "GB",
  CANADA: "CA",
  AUSTRALIA: "AU",
  UAE: "AE",
  DUBAI: "AE",
  PAKISTAN: "PK",
  BANGLADESH: "BD",
  NEPAL: "NP",
  GERMANY: "DE",
  FRANCE: "FR",
  JAPAN: "JP",
  KOREA: "KR",
  SOUTHKOREA: "KR",
  BRAZIL: "BR",
  WORLD: "GLOBAL",
  WORLDWIDE: "GLOBAL",
  ALL: "GLOBAL",
};

export function detectUserCountry(req: Request | NextRequest): RegionInfo {
  try {
    const url = new URL(req.url);

    // 1. Explicit Query Param (?region=US or ?country=IN or ?region=india)
    const rawQuery = (url.searchParams.get("region") || url.searchParams.get("country") || "").trim();
    if (rawQuery) {
      const upper = rawQuery.toUpperCase();
      const cleaned = upper.replace(/[^A-Z]/g, "");
      if (REGIONS[upper]) return REGIONS[upper];
      if (ALIASES[cleaned] && REGIONS[ALIASES[cleaned]]) return REGIONS[ALIASES[cleaned]];
    }

    // 2. Cookie (user_region)
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/(?:^|;\s*)user_region=([A-Za-z_-]{2,20})/);
    if (cookieMatch) {
      const cookieVal = cookieMatch[1].toUpperCase().replace(/[^A-Z]/g, "");
      if (REGIONS[cookieVal]) return REGIONS[cookieVal];
      if (ALIASES[cookieVal] && REGIONS[ALIASES[cookieVal]]) return REGIONS[ALIASES[cookieVal]];
    }

    // 3. Forwarded / Edge Headers from CDN (Cloudflare, Vercel, Proxies)
    const edgeCountry = (
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-user-country") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country-code") ||
      req.headers.get("x-geo-country") ||
      ""
    ).toUpperCase().trim();

    if (edgeCountry && edgeCountry !== "XX" && edgeCountry !== "T1") {
      if (REGIONS[edgeCountry]) return REGIONS[edgeCountry];
      if (ALIASES[edgeCountry] && REGIONS[ALIASES[edgeCountry]]) return REGIONS[ALIASES[edgeCountry]];
      if (edgeCountry.length === 2) {
        try {
          const displayName = new Intl.DisplayNames(["en"], { type: "region" }).of(edgeCountry);
          return {
            code: edgeCountry,
            name: displayName || edgeCountry,
          };
        } catch {
          return { code: edgeCountry, name: edgeCountry };
        }
      }
    }

    // 4. Accept-Language header inference
    const acceptLang = (req.headers.get("accept-language") || "").toLowerCase();
    if (acceptLang) {
      if (acceptLang.includes("-in") || acceptLang.includes("hi") || acceptLang.includes("ta") || acceptLang.includes("te")) {
        return REGIONS.IN;
      }
      if (acceptLang.includes("-us")) {
        return REGIONS.US;
      }
      if (acceptLang.includes("-gb") || acceptLang.includes("-uk")) {
        return REGIONS.GB;
      }
      if (acceptLang.includes("-ca")) {
        return REGIONS.CA;
      }
      if (acceptLang.includes("-au")) {
        return REGIONS.AU;
      }
      if (acceptLang.includes("-de") || acceptLang.includes("de-")) {
        return REGIONS.DE;
      }
      if (acceptLang.includes("-fr") || acceptLang.includes("fr-")) {
        return REGIONS.FR;
      }
      if (acceptLang.includes("-jp") || acceptLang.includes("ja")) {
        return REGIONS.JP;
      }
      if (acceptLang.includes("-kr") || acceptLang.includes("ko")) {
        return REGIONS.KR;
      }
    }
  } catch (err) {
    console.warn("Error detecting country:", err);
  }

  // 5. Default Fallback
  return REGIONS.IN;
}
