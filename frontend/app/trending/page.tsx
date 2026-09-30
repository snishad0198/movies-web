import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getTrending } from "@/lib/api";
import { TrendingLeaderboard } from "@/components/trending/TrendingLeaderboard";
import { Flame, Globe, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface TrendingPageProps {
  searchParams: {
    region?: string;
    limit?: string;
  };
}

const REGION_OPTIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "AE", label: "UAE" },
  { code: "PK", label: "Pakistan" },
  { code: "GLOBAL", label: "Worldwide" },
];

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const headerStore = headers();
  const forwardHeaders: Record<string, string> = {};
  const acceptLang = headerStore.get("accept-language");
  if (acceptLang) forwardHeaders["accept-language"] = acceptLang;
  const cfCountry = headerStore.get("cf-ipcountry");
  if (cfCountry) forwardHeaders["cf-ipcountry"] = cfCountry;
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) forwardHeaders["x-forwarded-for"] = forwardedFor;
  const cookie = headerStore.get("cookie");
  if (cookie) forwardHeaders["cookie"] = cookie;

  // Derive region from searchParams or cookie or default to IN
  let region = (searchParams.region || "").toUpperCase().trim();
  if (!region && cookie) {
    const match = cookie.match(/user_region=([A-Za-z_-]{2,10})/);
    if (match) region = match[1].toUpperCase();
  }
  if (!region) {
    region = "IN";
  }

  const limit = Math.min(100, Math.max(20, parseInt(searchParams.limit || "60", 10)));
  const items = await getTrending({
    region,
    limit,
    headers: forwardHeaders,
  });

  const currentRegionLabel =
    REGION_OPTIONS.find((r) => r.code === region)?.label || region;

  return (
    <div className="min-h-screen bg-[#08080c] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner with Glow and Real-time Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-950/40">
              <Flame className="w-5 h-5 text-[#e50914] animate-pulse" />
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
              Trending Leaderboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time streaming popularity index with 4K Ultra-HD titles and latest blockbusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 font-semibold text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Ranking
          </span>
        </div>
      </div>

      {/* Leaderboard Showcase Component */}
      {items.length > 0 ? (
        <TrendingLeaderboard
          initialItems={items}
          regionCode={region}
          regionName={currentRegionLabel}
        />
      ) : (
        <div className="py-24 text-center text-slate-400 bg-[#121218] rounded-3xl border border-white/5 space-y-4">
          <Globe className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-bold text-white">
              No trending titles currently found for {currentRegionLabel}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please check back shortly or explore our curated Indian Blockbusters and Web Series catalog.
            </p>
          </div>
          <Link
            href="/trending?region=IN"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#f40612] text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch to India Trending</span>
          </Link>
        </div>
      )}
    </div>
  );
}
