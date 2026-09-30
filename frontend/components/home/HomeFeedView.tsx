"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Film,
  Tv,
  Flame,
  Globe,
  Sparkles,
  History,
  Play,
  ChevronRight,
  ChevronLeft,
  Star,
} from "lucide-react";
import { MovieItem, Genre } from "@/lib/types";
import { MovieRow } from "@/components/movies/MovieRow";
import { MovieCard } from "@/components/movies/MovieCard";

interface CuratedRow {
  title: string;
  type?: string;
  showRank?: boolean;
  region?: string;
  regionName?: string;
  viewAllHref?: string;
  items: MovieItem[];
}

interface HomeFeedViewProps {
  initialRows: CuratedRow[];
  genres: Genre[];
  userRegion?: {
    code: string;
    name: string;
  };
}

type TabType = "all" | "movies" | "series" | "india" | "hollywood" | "anime";

const CATEGORY_TABS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All Home", icon: Compass },
  { id: "movies", label: "Movies", icon: Film },
  { id: "series", label: "Web Series", icon: Tv },
  { id: "india", label: "Desi Indian", icon: Flame },
  { id: "hollywood", label: "Hollywood", icon: Globe },
  { id: "anime", label: "Anime", icon: Sparkles },
];

export function HomeFeedView({ initialRows, genres, userRegion }: HomeFeedViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [continueWatching, setContinueWatching] = useState<MovieItem[]>([]);

  useEffect(() => {
    // Load local storage watch history (matches legacy PHP behavior)
    try {
      const stored = localStorage.getItem("watch_history") || localStorage.getItem("movies_snishad_watch_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setContinueWatching(parsed.slice(0, 10));
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  // Filter rows based on active category tab
  const filteredRows = initialRows.filter((row) => {
    const t = (row.type || "").toLowerCase();
    switch (activeTab) {
      case "movies":
        return (
          t === "indian_new" ||
          t === "hollywood" ||
          t === "south_all" ||
          t === "classic_old" ||
          t === "upcoming"
        );
      case "series":
        return (
          t === "indian_series" ||
          t === "holywood_series" ||
          t === "anime"
        );
      case "india":
        return (
          t === "trending" ||
          t === "indian_new" ||
          t === "indian_series" ||
          t === "south_all"
        );
      case "hollywood":
        return (
          t === "hollywood" ||
          t === "holywood_series" ||
          t === "upcoming"
        );
      case "anime":
        return t === "anime";
      case "all":
      default:
        return true;
    }
  });

  const activeRegionCode = (userRegion?.code || "IN").toUpperCase();
  const activeRegionName = userRegion?.name || "India";

  return (
    <div className="space-y-6">
      {/* Category Navigation Pills Bar & Country Region Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-30 space-y-3">
        {/* Main Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "bg-[#e50914] text-white shadow-lg shadow-red-600/30 scale-[1.03]"
                    : "bg-[#161624]/90 hover:bg-[#1f1f33] text-slate-300 hover:text-white border border-white/10 backdrop-blur-md"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clean Genre Quick-Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 pl-1 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#e50914]" />
            <span>Popular Genres:</span>
          </span>
          {genres
            .filter((g) => {
              const name = (g?.name || "").toLowerCase();
              const slug = (g?.slug || "").toLowerCase();
              return (
                !name.includes("18+") &&
                !name.includes("adult") &&
                !slug.includes("18+") &&
                !slug.includes("adult")
              );
            })
            .slice(0, 10)
            .map((genre) => (
              <Link
                key={genre.id}
                href={`/movies?genre=${genre.slug}`}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/5 transition-all flex-shrink-0 cursor-pointer"
              >
                {genre.name}
              </Link>
            ))}
        </div>
      </div>

      {/* Continue Watching Shelf (Matches PHP 'cwArea') */}
      {continueWatching.length > 0 && (
        <section className="relative py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-amber-400 font-display uppercase">
                Continue Watching
              </h2>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("watch_history");
                localStorage.removeItem("movies_snishad_watch_history");
                setContinueWatching([]);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear History
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2">
            {continueWatching.map((item) => (
              <div key={item.id} className="w-[140px] sm:w-[170px] flex-shrink-0">
                <MovieCard movie={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Curated Rows */}
      <div className="space-y-4 pt-2">
        {filteredRows.map((row, idx) => (
          <MovieRow
            key={row.type || idx}
            title={row.title}
            items={row.items}
            showRank={row.showRank || row.type === "trending"}
            viewAllHref={row.viewAllHref}
          />
        ))}

        {filteredRows.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <p className="text-base font-semibold text-white mb-1">No titles found in this category.</p>
            <button
              onClick={() => setActiveTab("all")}
              className="mt-3 px-4 py-2 rounded-lg bg-[#e50914] text-white text-xs font-semibold cursor-pointer"
            >
              View All Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
