import React from "react";
import Link from "next/link";
import { getSeries, getGenres } from "@/lib/api";
import { MovieCard } from "@/components/movies/MovieCard";
import { Tv, Filter, Award, Flame, Sparkles, Clock, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

interface SeriesPageProps {
  searchParams: {
    page?: string;
    category?: string;
    genre?: string;
    sort?: string;
  };
}

const CATEGORIES = [
  { id: "all", label: "All Series", icon: Tv },
  { id: "indian", label: "Indian Web Series", icon: Flame },
  { id: "hollywood", label: "Hollywood & Global", icon: Globe },
  { id: "anime", label: "Anime Series", icon: Sparkles },
  { id: "kdrama", label: "K-Drama Hits", icon: Award },
  { id: "old", label: "Classic & Retro TV", icon: Clock },
];

const SORT_OPTIONS = [
  { id: "popularity", label: "Most Popular" },
  { id: "rating", label: "Top Rated IMDb" },
  { id: "latest", label: "Latest Releases" },
];

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const category = searchParams.category || "all";
  const genre = searchParams.genre;
  const sort = searchParams.sort || "popularity";

  const [data, genres] = await Promise.all([
    getSeries({
      page,
      limit: 20,
      category: category !== "all" ? category : undefined,
      genre,
      sort,
    }),
    getGenres(),
  ]);

  const seriesList = data?.series || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  const buildUrl = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const current = {
      ...(category !== "all" ? { category } : {}),
      ...(genre ? { genre } : {}),
      ...(sort !== "popularity" ? { sort } : {}),
      ...updates,
    };

    Object.entries(current).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "all") {
        params.set(k, String(v));
      }
    });

    const str = params.toString();
    return str ? `/series?${str}` : "/series";
  };

  return (
    <div className="min-h-screen bg-[#08080c] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv className="w-6 h-6 text-purple-400" />
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
              Web Series &amp; TV Shows
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Stream and download complete seasons and episodes in Hindi &amp; English Dual Audio.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <div className="flex items-center gap-1 bg-[#121218] p-1 rounded-xl border border-white/10">
            {SORT_OPTIONS.map((s) => {
              const isActive = sort === s.id;
              return (
                <Link
                  key={s.id}
                  href={buildUrl({ sort: s.id, page: 1 })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#e50914] text-white shadow-sm shadow-red-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#e50914]" />
          <span>Industry &amp; Series Types</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <Link
                key={cat.id}
                href={buildUrl({ category: cat.id, page: 1 })}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#e50914] text-white shadow-md shadow-red-600/30 scale-[1.02]"
                    : "bg-[#14141f] hover:bg-[#1c1c2b] text-slate-300 hover:text-white border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Genres Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Genres
          </span>
          {genre && (
            <Link
              href={buildUrl({ genre: undefined, page: 1 })}
              className="text-xs text-[#e50914] hover:underline"
            >
              Clear genre filter
            </Link>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {genres.map((g) => {
            const isActive = genre === g.slug;
            return (
              <Link
                key={g.id}
                href={buildUrl({ genre: isActive ? undefined : g.slug, page: 1 })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#e50914] text-white font-semibold shadow-sm"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                }`}
              >
                {g.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {seriesList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {seriesList.map((item) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-slate-400 bg-[#121218] rounded-2xl border border-white/5">
          <Tv className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-white mb-1">No web series found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your category or genre filters to discover more series.
          </p>
          <Link
            href="/series"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#e50914] text-white text-xs font-semibold"
          >
            Reset Filters
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8">
          {page > 1 && (
            <Link
              href={buildUrl({ page: page - 1 })}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-xs text-slate-400 font-medium px-2">
            Page {page} of {pagination.totalPages}
          </span>
          {page < pagination.totalPages && (
            <Link
              href={buildUrl({ page: page + 1 })}
              className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-red-600 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
