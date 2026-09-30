import React from "react";
import Link from "next/link";
import { getMovies, getGenres } from "@/lib/api";
import { MovieCard } from "@/components/movies/MovieCard";
import { Film, Filter, Calendar, Award, Flame, Sparkles, Clock, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

interface MoviesPageProps {
  searchParams: {
    page?: string;
    category?: string;
    genre?: string;
    year?: string;
    yearRange?: string;
    sort?: string;
  };
}

const CATEGORIES = [
  { id: "all", label: "All Movies", icon: Film },
  { id: "bollywood", label: "Bollywood (Hindi)", icon: Flame },
  { id: "hollywood", label: "Hollywood (English)", icon: Globe },
  { id: "south", label: "South Indian", icon: Sparkles },
  { id: "old", label: "Classic & Old Cinema", icon: Clock },
  { id: "punjabi", label: "Punjabi Hits", icon: Award },
  { id: "animation", label: "Animation & Family", icon: Film },
];

const YEAR_RANGES = [
  { id: "all", label: "All Years" },
  { id: "2026", label: "2026 Hits", year: 2026 },
  { id: "2025", label: "2025", year: 2025 },
  { id: "2024", label: "2024", year: 2024 },
  { id: "2020s", label: "2020 - 2023", range: "2020s" },
  { id: "2010s", label: "2010s Decade", range: "2010s" },
  { id: "vintage", label: "Classic (Pre-2000)", range: "vintage" },
];

const SORT_OPTIONS = [
  { id: "popularity", label: "Most Popular" },
  { id: "rating", label: "Top Rated IMDb" },
  { id: "latest", label: "Latest Releases" },
];

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const category = searchParams.category || "all";
  const genre = searchParams.genre;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : undefined;
  const yearRange = searchParams.yearRange;
  const sort = searchParams.sort || "popularity";

  const [data, genres] = await Promise.all([
    getMovies({
      page,
      limit: 20,
      category: category !== "all" ? category : undefined,
      genre,
      year,
      yearRange,
      sort,
    }),
    getGenres(),
  ]);

  const movies = data?.movies || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  // Helper to build filter URLs
  const buildUrl = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const current = {
      ...(category !== "all" ? { category } : {}),
      ...(genre ? { genre } : {}),
      ...(year ? { year } : {}),
      ...(yearRange ? { yearRange } : {}),
      ...(sort !== "popularity" ? { sort } : {}),
      ...updates,
    };

    Object.entries(current).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "all") {
        params.set(k, String(v));
      }
    });

    const str = params.toString();
    return str ? `/movies?${str}` : "/movies";
  };

  return (
    <div className="min-h-screen bg-[#08080c] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-6 h-6 text-[#e50914]" />
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
              Browse Movies
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore Bollywood, Hollywood, South Indian action, and timeless classic cinema.
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

      {/* Category Pills (Bollywood, Hollywood, South, Old, Punjabi, Animation) */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#e50914]" />
          <span>Industry &amp; Categories</span>
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

      {/* Release Year & Decades */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>Release Era &amp; Year</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {YEAR_RANGES.map((y) => {
            const isActive =
              (y.year && year === y.year) ||
              (y.range && yearRange === y.range) ||
              (y.id === "all" && !year && !yearRange);

            return (
              <Link
                key={y.id}
                href={buildUrl({
                  year: y.year,
                  yearRange: y.range,
                  page: 1,
                })}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white/20 text-white font-bold border border-white/30"
                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5"
                }`}
              >
                {y.label}
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

      {/* Active Filter Summary */}
      {(category !== "all" || genre || year || yearRange) && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300">
          <span className="font-semibold text-white">Active Filters:</span>
          {category !== "all" && (
            <span className="px-2 py-0.5 rounded bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30 uppercase font-semibold">
              {category}
            </span>
          )}
          {genre && (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              Genre: {genre}
            </span>
          )}
          {(year || yearRange) && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Year: {year || yearRange}
            </span>
          )}
          <Link
            href="/movies"
            className="ml-auto text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Reset All
          </Link>
        </div>
      )}

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5">
          <Film className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-semibold text-white mb-1">No movies found in this selection</p>
          <p className="text-xs mb-4">Try clearing one of the filters or choosing another category.</p>
          <Link
            href="/movies"
            className="px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-semibold shadow-lg shadow-red-600/30"
          >
            Browse All Movies
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-12">
          {page > 1 && (
            <Link
              href={buildUrl({ page: page - 1 })}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Previous Page
            </Link>
          )}
          <span className="text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
            Page {page} of {pagination.totalPages}
          </span>
          {page < pagination.totalPages && (
            <Link
              href={buildUrl({ page: page + 1 })}
              className="px-4 py-2 rounded-xl bg-[#e50914] hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-md shadow-red-600/30"
            >
              Next Page
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
