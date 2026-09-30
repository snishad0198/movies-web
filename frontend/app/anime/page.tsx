import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { getAnime } from "@/lib/api";
import { MovieCard } from "@/components/movies/MovieCard";
import {
  Sparkles,
  Flame,
  Wand2,
  Heart,
  Ghost,
  Film,
  Star,
  Tv,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anime Universe - Watch & Download Free Anime | Movies.snishad",
  description:
    "Explore the ultimate anime universe on Movies.snishad. Stream & download Action Shonen, Isekai Fantasy, Romance, and Anime Feature Films in Ultra-HD with Japanese and dual audio.",
};

interface AnimePageProps {
  searchParams: {
    category?: string;
    page?: string;
  };
}

const ANIME_CATEGORIES = [
  { id: "all", label: "All Anime", icon: Sparkles },
  { id: "action", label: "Action / Shonen", icon: Flame },
  { id: "isekai", label: "Isekai & Fantasy", icon: Wand2 },
  { id: "romance", label: "Romance & Slice of Life", icon: Heart },
  { id: "supernatural", label: "Dark Fantasy & Mystery", icon: Ghost },
  { id: "movies", label: "Feature Films", icon: Film },
  { id: "top_rated", label: "Top Rated", icon: Star },
];

export default async function AnimePage({ searchParams }: AnimePageProps) {
  const currentCategory = searchParams.category || "all";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));

  const data = await getAnime({
    category: currentCategory,
    page: currentPage,
  });

  const animeList = data?.anime || [];
  const pagination = data?.pagination || { page: 1, totalPages: 50, hasMore: true };

  const buildUrl = (updates: { category?: string; page?: number }) => {
    const params = new URLSearchParams();
    const cat = updates.category !== undefined ? updates.category : currentCategory;
    const p = updates.page !== undefined ? updates.page : currentPage;

    if (cat && cat !== "all") params.set("category", cat);
    if (p > 1) params.set("page", String(p));

    const qs = params.toString();
    return qs ? `/anime?${qs}` : "/anime";
  };

  const activeCategoryObj =
    ANIME_CATEGORIES.find((c) => c.id === currentCategory) || ANIME_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#08080c] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. ANIME PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e50914]">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
            <span>Japanese Animation &bull; Sub &amp; Dub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white uppercase">
            Anime <span className="text-[#e50914]">Universe</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Stream and download popular anime series, shonen hits, and theatrical movies in 4K Ultra-HD.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-[#12121e] border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Tv className="w-3.5 h-3.5 text-[#e50914]" />
            <span>{animeList.length} Titles Loaded</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-xs font-semibold text-red-400">
            {activeCategoryObj.label}
          </span>
        </div>
      </div>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#e50914]" />
          <span>Anime Subcategories</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {ANIME_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = currentCategory === cat.id;
            return (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.id, page: 1 })}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#e50914] text-white shadow-lg shadow-red-600/30 scale-[1.02]"
                    : "bg-[#141420] hover:bg-[#1f1f32] text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. ANIME CARDS GRID (ALL TITLES DIRECTLY DISPLAYED) */}
      {animeList.length === 0 ? (
        <div className="py-24 text-center space-y-4 rounded-3xl bg-[#11111a] border border-white/5">
          <Sparkles className="w-10 h-10 text-[#e50914] mx-auto opacity-60" />
          <h3 className="text-lg sm:text-xl font-display font-bold text-white uppercase">No Anime Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            We couldn't find any anime in this filter. Try selecting another category above.
          </p>
          <Link
            href="/anime"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all"
          >
            View All Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {animeList.map((anime) => (
            <MovieCard key={anime.id} movie={anime} />
          ))}
        </div>
      )}

      {/* 4. PAGINATION CONTROLS */}
      <div className="flex items-center justify-center gap-3 pt-8 border-t border-white/5">
        {currentPage > 1 && (
          <Link
            href={buildUrl({ page: currentPage - 1 })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141420] hover:bg-[#1f1f32] text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Link>
        )}

        <span className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-semibold text-slate-300">
          Page {currentPage} of {pagination.totalPages || 50}
        </span>

        {pagination.hasMore && (
          <Link
            href={buildUrl({ page: currentPage + 1 })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold border border-red-500/30 transition-all shadow-md shadow-red-600/30 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
