"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { LazyImage } from "@/components/ui/LazyImage";
import {
  Flame,
  Crown,
  Trophy,
  Medal,
  Star,
  Play,
  Info,
  Sparkles,
  LayoutGrid,
  List,
  Film,
  Tv,
  Globe,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Clock,
  Radio,
  Check,
} from "lucide-react";
import { MovieItem } from "@/lib/types";
import { formatRating, getImageUrl } from "@/lib/utils";
import { normalizeMovie } from "@/lib/api";

interface TrendingLeaderboardProps {
  initialItems: MovieItem[];
  regionCode: string;
  regionName: string;
}

type FilterTab = "all" | "movies" | "series" | "indian" | "south" | "hollywood";

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

export function TrendingLeaderboard({
  initialItems,
  regionCode,
  regionName,
}: TrendingLeaderboardProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>(regionCode.toUpperCase());
  const [selectedRegionName, setSelectedRegionName] = useState<string>(regionName);
  const [items, setItems] = useState<MovieItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState<string>("");

  // Live real-time timestamp display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
  }, []);

  // Update items if parent initialItems change
  useEffect(() => {
    setItems(initialItems);
    setSelectedRegion(regionCode.toUpperCase());
    setSelectedRegionName(regionName);
  }, [initialItems, regionCode, regionName]);

  // Instant Region Switcher: client-side fetch + cookie + url sync
  const handleRegionSwitch = async (newCode: string, newName: string) => {
    if (newCode === selectedRegion && !loading) return;

    setSelectedRegion(newCode);
    setSelectedRegionName(newName);
    setLoading(true);

    // Persist in cookie so entire website reflects region choice
    document.cookie = `user_region=${newCode}; path=/; max-age=31536000; SameSite=Lax`;
    window.history.pushState({}, "", `/trending?region=${newCode}`);

    try {
      const res = await fetch(`/api/proxy/trending?region=${newCode}&limit=60`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        setItems(list.map(normalizeMovie));
      } else {
        // Fallback to direct navigation
        window.location.href = `/trending?region=${newCode}`;
      }
    } catch (err) {
      console.warn("Region switch client fetch error, falling back to reload:", err);
      window.location.href = `/trending?region=${newCode}`;
    } finally {
      setLoading(false);
    }
  };

  // Categorize and filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchLang = (item.language || "").toLowerCase().includes(q);
        if (!matchTitle && !matchLang) return false;
      }

      // Tab filter
      const isSeries = item.type === "SERIES";
      const lang = (item.language || "").toLowerCase();

      switch (activeTab) {
        case "movies":
          return !isSeries;
        case "series":
          return isSeries;
        case "indian":
          return (
            lang.includes("hindi") ||
            lang.includes("punjabi") ||
            lang.includes("bengali") ||
            lang.includes("marathi")
          );
        case "south":
          return (
            lang.includes("telugu") ||
            lang.includes("tamil") ||
            lang.includes("malayalam") ||
            lang.includes("kannada")
          );
        case "hollywood":
          return lang.includes("english");
        case "all":
        default:
          return true;
      }
    });
  }, [items, activeTab, searchQuery]);

  const top1 = filteredItems[0] || items[0];
  const top2 = filteredItems[1] || items[1];
  const top3 = filteredItems[2] || items[2];

  return (
    <div className="space-y-8">
      {/* TOP 3 PODIUM / CHAMPIONS SHOWCASE */}
      {loading ? (
        <div className="h-64 rounded-3xl bg-[#101018] animate-pulse border border-white/5 flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Radio className="w-5 h-5 text-[#e50914] animate-spin" />
            <span>Loading trending titles...</span>
          </div>
        </div>
      ) : (
        !searchQuery && activeTab === "all" && items.length >= 3 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-display font-black text-white tracking-wide uppercase">
                    Top 3 Trending Champions
                  </h2>
                  <p className="text-xs text-slate-400">
                    Highest streaming velocity and viewer engagement in the current period
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-xs font-semibold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Leaderboard Podium
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
              {/* #1 GOLD CROWN HERO PODIUM */}
              {top1 && (
                <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-b from-amber-950/40 via-[#101018] to-[#08080c] shadow-2xl shadow-amber-950/40 group">
                  <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
                    <LazyImage
                      src={getImageUrl(top1.backdropPath || top1.backdrop || top1.posterPath)}
                      alt={top1.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      fallbackText={top1.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/60 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14]/80 via-transparent to-transparent pointer-events-none" />

                    {/* Gold Champion Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs shadow-xl shadow-amber-500/40 uppercase tracking-wider">
                        <Crown className="w-4 h-4 fill-black" />
                        <span>#1 Trending Champion</span>
                      </div>
                    </div>

                    {/* Quality & Year Badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-xs font-black tracking-wider uppercase">
                        {top1.releaseYear}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                        {top1.type}
                      </span>
                    </div>

                    {/* Giant Gold Rank Watermark */}
                    <div className="absolute bottom-2 right-4 text-7xl sm:text-8xl font-display font-black text-amber-400/20 select-none pointer-events-none drop-shadow">
                      01
                    </div>
                  </div>

                  {/* Content Strip */}
                  <div className="p-5 sm:p-6 relative z-10 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold">{top1.releaseYear}</span>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                        {top1.language || "Hindi"}
                      </span>
                      {top1.rating && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {formatRating(top1.rating)} IMDb
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors">
                      {top1.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {top1.overview || "Stream and download in 4K Ultra-HD with high-speed direct cloud links on Movies.snishad."}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href={top1.type === "SERIES" ? `/series/${top1.slug}` : `/movie/${top1.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Watch #1 Title</span>
                      </Link>

                      <Link
                        href={top1.type === "SERIES" ? `/series/${top1.slug}` : `/movie/${top1.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Details &amp; Links</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* #2 SILVER & #3 BRONZE STACK */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* #2 Silver Runner Up */}
                {top2 && (
                  <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-400/40 bg-gradient-to-r from-slate-900/60 via-[#101018] to-[#0a0a12] p-4 sm:p-5 flex items-center gap-4 group hover:border-slate-300 transition-all shadow-xl">
                    <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-black">
                      <LazyImage
                        src={getImageUrl(top2.posterPath || top2.poster)}
                        alt={top2.title}
                        fill
                        sizes="120px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackText={top2.title}
                      />
                      <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-slate-200 text-black font-black text-xs flex items-center justify-center shadow">
                        2
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-300/20 text-slate-200 border border-slate-300/30 uppercase">
                          <Trophy className="w-3 h-3 text-slate-300" />
                          #2 Runner Up
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {top2.releaseYear} &bull; {top2.language}
                        </span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase truncate group-hover:text-slate-200 transition-colors">
                        {top2.title}
                      </h3>

                      {top2.rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{formatRating(top2.rating)} IMDb</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {top2.overview || "High-speed streaming & direct download links available."}
                      </p>

                      <div className="pt-1">
                        <Link
                          href={top2.type === "SERIES" ? `/series/${top2.slug}` : `/movie/${top2.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Stream Now</span>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden sm:block text-5xl font-display font-black text-slate-400/20 select-none pointer-events-none mr-2">
                      02
                    </div>
                  </div>
                )}

                {/* #3 Bronze Contender */}
                {top3 && (
                  <div className="flex-1 relative rounded-3xl overflow-hidden border border-amber-700/40 bg-gradient-to-r from-amber-950/30 via-[#101018] to-[#0a0a12] p-4 sm:p-5 flex items-center gap-4 group hover:border-amber-600/50 transition-all shadow-xl">
                    <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden flex-shrink-0 shadow-md bg-black">
                      <LazyImage
                        src={getImageUrl(top3.posterPath || top3.poster)}
                        alt={top3.title}
                        fill
                        sizes="120px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fallbackText={top3.title}
                      />
                      <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-md bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow">
                        3
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-700/20 text-amber-400 border border-amber-700/30 uppercase">
                          <Medal className="w-3 h-3 text-amber-500" />
                          #3 Contender
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {top3.releaseYear} &bull; {top3.language}
                        </span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase truncate group-hover:text-amber-300 transition-colors">
                        {top3.title}
                      </h3>

                      {top3.rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{formatRating(top3.rating)} IMDb</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {top3.overview || "High-speed streaming & direct download links available."}
                      </p>

                      <div className="pt-1">
                        <Link
                          href={top3.type === "SERIES" ? `/series/${top3.slug}` : `/movie/${top3.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Stream Now</span>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden sm:block text-5xl font-display font-black text-amber-600/20 select-none pointer-events-none mr-2">
                      03
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      )}

      {/* 3. FILTER TABS & CONTROLS */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", label: "All Top Ranked", icon: TrendingUp },
              { id: "indian", label: "Bollywood Hits", icon: Flame },
              { id: "south", label: "South Indian Hits", icon: Sparkles },
              { id: "series", label: "Web Series", icon: Tv },
              { id: "movies", label: "Movies Only", icon: Film },
              { id: "hollywood", label: "Hollywood & Global", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#e50914] text-white shadow-md shadow-red-600/30 font-bold"
                      : "bg-[#14141e] hover:bg-[#1c1c2b] text-slate-300 hover:text-white border border-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + View Mode Switcher */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter titles..."
                className="w-36 sm:w-48 bg-[#14141e] border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e50914]"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center bg-[#14141e] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-[#e50914] text-white" : "text-slate-400 hover:text-white"
                }`}
                aria-label="Grid View"
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-[#e50914] text-white" : "text-slate-400 hover:text-white"
                }`}
                aria-label="List View"
                title="List Leaderboard View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Displaying <strong className="text-white font-bold">{filteredItems.length}</strong> titles in <strong className="text-white">{selectedRegionName}</strong>
          </span>
          <span className="text-[11px] text-slate-500">
            Current Active Catalog (2024&ndash;2026) &bull; Free HD Streaming
          </span>
        </div>
      </section>

      {/* 4. MAIN LEADERBOARD DISPLAY */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-[#101018] rounded-3xl border border-white/5">
          <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No titles match your filter</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or search query.</p>
          <button
            onClick={() => {
              setActiveTab("all");
              setSearchQuery("");
            }}
            className="mt-3 px-4 py-1.5 rounded-xl bg-[#e50914] text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => {
            const rank = (item as any).rank || index + 1;
            const href = item.type === "SERIES" ? `/series/${item.slug}` : `/movie/${item.slug}`;
            const posterUrl = getImageUrl(item.posterPath || (item as any).poster);

            return (
              <div key={`${item.id}-${rank}`} className="group relative flex-shrink-0 select-none">
                <Link
                  href={href}
                  className="block relative overflow-hidden rounded-2xl bg-[#12121c] border border-white/5 shadow-lg group-hover:border-red-500/50 group-hover:shadow-2xl group-hover:shadow-red-950/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/40">
                    <LazyImage
                      src={posterUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 260px"
                      className="object-cover transition-transform duration-500 group-hover:scale-108"
                      fallbackText={item.title}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121c] via-transparent to-transparent opacity-80" />

                    {/* 3D Metallic Rank Badge */}
                    <div className="absolute top-2.5 left-2.5 z-20">
                      <div
                        className={`px-2.5 py-1 rounded-xl font-display font-black text-sm sm:text-base tracking-wider shadow-lg flex items-center gap-1 ${
                          rank === 1
                            ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-amber-500/40 ring-1 ring-amber-300"
                            : rank === 2
                            ? "bg-gradient-to-r from-slate-200 to-slate-400 text-black shadow-slate-400/40 ring-1 ring-slate-100"
                            : rank === 3
                            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-amber-600/40 ring-1 ring-amber-500"
                            : rank <= 10
                            ? "bg-[#e50914] text-white shadow-red-600/40"
                            : "bg-black/80 backdrop-blur-md text-white border border-white/20"
                        }`}
                      >
                        <span>#{rank < 10 ? `0${rank}` : rank}</span>
                      </div>
                    </div>

                    {/* Top Right Type */}
                    <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1 items-end">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-slate-200 border border-white/15">
                        {item.type === "SERIES" ? "Series" : "Movie"}
                      </span>
                    </div>

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                      <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-xl shadow-red-600/50 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Rating Pill */}
                    {item.rating && (
                      <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 border border-white/10 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{formatRating(item.rating)}</span>
                      </div>
                    )}

                    {/* Language Badge */}
                    <div className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-slate-300 border border-white/10 text-[10px] font-semibold uppercase">
                      {item.language || "Hindi"}
                    </div>
                  </div>

                  {/* Title & Strip */}
                  <div className="p-3.5 bg-[#12121c] border-t border-white/5 space-y-1">
                    <h3
                      className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#e50914] transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">{item.releaseYear || "2024"}</span>
                      <span className="text-slate-500 font-medium truncate max-w-[90px] text-right">
                        {item.genres && item.genres[0] ? item.genres[0].name : "Trending"}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item, index) => {
            const rank = (item as any).rank || index + 1;
            const href = item.type === "SERIES" ? `/series/${item.slug}` : `/movie/${item.slug}`;
            const posterUrl = getImageUrl(item.posterPath || (item as any).poster);

            return (
              <Link
                key={`${item.id}-${rank}`}
                href={href}
                className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-[#11111a] hover:bg-[#181824] border border-white/5 hover:border-white/15 transition-all group shadow-md"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl flex items-center justify-center font-display font-black text-sm sm:text-lg flex-shrink-0 ${
                      rank === 1
                        ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30"
                        : rank === 2
                        ? "bg-slate-200 text-black shadow-lg shadow-slate-300/30"
                        : rank === 3
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                        : rank <= 10
                        ? "bg-[#e50914] text-white"
                        : "bg-white/5 text-slate-300 border border-white/10"
                    }`}
                  >
                    #{rank < 10 ? `0${rank}` : rank}
                  </div>

                  <div className="relative w-12 sm:w-14 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-black">
                    <LazyImage
                      src={posterUrl}
                      alt={item.title}
                      fill
                      sizes="60px"
                      className="object-cover"
                      fallbackText={item.title}
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-slate-300">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.releaseYear} &bull; {item.language || "Hindi"}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-[#e50914] transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {item.rating && (
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {formatRating(item.rating)}
                        </span>
                      )}
                      <span className="hidden sm:inline text-slate-500">
                        {item.genres?.slice(0, 2).map((g) => g.name).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden md:flex flex-col items-end text-right">
                    <span className="text-xs font-semibold text-white">Full HD 1080p</span>
                    <span className="text-[11px] text-emerald-400 font-medium">Free Streaming</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e50914] group-hover:bg-[#f40612] text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all">
                    <Play className="w-3 h-3 fill-white" />
                    <span className="hidden sm:inline">Watch</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
