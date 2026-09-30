"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  SlidersHorizontal,
  X,
  RotateCcw,
  Star,
  Film,
  Tv,
  Sparkles,
  Compass,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  Globe,
  Filter,
} from "lucide-react";
import { MovieItem, Genre } from "@/lib/types";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieGridSkeleton } from "@/components/ui/MovieCardSkeleton";
import { searchTitles, getGenres } from "@/lib/api";

const POPULAR_SEARCHES = [
  "Spider-Man",
  "Toxic",
  "Reacher",
  "Doraemon",
  "Toy Story",
  "Pinocchio",
  "Deadpool",
  "Demon Slayer",
  "Avengers",
  "Miraculous",
];

const YEAR_OPTIONS = [
  { id: "all", label: "All Years" },
  { id: "2026", label: "2026 Hits" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2020s", label: "2020 - 2023" },
  { id: "2010s", label: "2010s Decade" },
  { id: "classic", label: "Classic (Pre-2010)" },
];

const RATING_OPTIONS = [
  { val: 0, label: "Any Rating" },
  { val: 8, label: "8.0+ Stars (Top Rated)" },
  { val: 7, label: "7.0+ Stars (Great)" },
  { val: 6, label: "6.0+ Stars (Good)" },
];

const LANGUAGE_OPTIONS = [
  { id: "all", label: "All Languages" },
  { id: "hindi", label: "Hindi / Bollywood" },
  { id: "english", label: "English / Hollywood" },
  { id: "south", label: "South Indian (Tamil/Telugu)" },
  { id: "japanese", label: "Japanese (Anime)" },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Most Relevant" },
  { id: "rating", label: "Top Rated (IMDb)" },
  { id: "year_desc", label: "Release Year (Newest)" },
  { id: "year_asc", label: "Release Year (Oldest)" },
  { id: "popularity", label: "Most Popular (Views)" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [rawResults, setRawResults] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load genres from backend for the filter dropdown
  useEffect(() => {
    getGenres()
      .then((data) => {
        if (Array.isArray(data)) {
          const clean = data.filter(
            (g) =>
              !g.slug?.toLowerCase().includes("adult") &&
              !g.slug?.toLowerCase().includes("18+") &&
              !g.name?.toLowerCase().includes("18+")
          );
          setGenres(clean);
        }
      })
      .catch(() => {});
  }, []);

  // Synchronize input if URL query param changes
  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam !== null && qParam !== query) {
      setQuery(qParam);
    }
  }, [searchParams]);

  // Fetch search results with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setRawResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiType = filterType === "ALL" || filterType === "ANIME" ? undefined : filterType;
        const data = await searchTitles(query.trim(), apiType);
        setRawResults(data || []);
      } catch (e) {
        setRawResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filterType]);

  // Handle instant search from suggestions
  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setFilterType("ALL");
    setSelectedGenre("all");
    setSelectedYear("all");
    setMinRating(0);
    setSelectedLang("all");
    setSortBy("relevance");
  };

  // Active filters count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterType !== "ALL") count++;
    if (selectedGenre !== "all") count++;
    if (selectedYear !== "all") count++;
    if (minRating > 0) count++;
    if (selectedLang !== "all") count++;
    if (sortBy !== "relevance") count++;
    return count;
  }, [filterType, selectedGenre, selectedYear, minRating, selectedLang, sortBy]);

  // Live filter and sort the raw search results
  const filteredResults = useMemo(() => {
    let list = [...rawResults];

    // 1. Format filter: ANIME
    if (filterType === "ANIME") {
      list = list.filter((item) => {
        const isAnimeGenre = (item.genres || []).some((g: any) => {
          const name = (g?.genre?.name || g?.name || "").toLowerCase();
          const slug = (g?.genre?.slug || g?.slug || "").toLowerCase();
          return name.includes("anime") || name.includes("animation") || slug.includes("anime");
        });
        const hasAnimeInTags = (item as any).tags?.toLowerCase().includes("anime");
        const isJapanese = (item.language || "").toLowerCase().includes("ja");
        return isAnimeGenre || hasAnimeInTags || isJapanese;
      });
    }

    // 2. Genre filter
    if (selectedGenre !== "all") {
      list = list.filter((item) => {
        return (item.genres || []).some((g: any) => {
          const slug = (g?.genre?.slug || g?.slug || "").toLowerCase();
          const name = (g?.genre?.name || g?.name || "").toLowerCase();
          return (
            slug === selectedGenre.toLowerCase() ||
            name.toLowerCase() === selectedGenre.toLowerCase()
          );
        });
      });
    }

    // 3. Release Year / Decade filter
    if (selectedYear !== "all") {
      list = list.filter((item) => {
        const y = item.releaseYear;
        if (!y) return false;
        if (selectedYear === "2026") return y === 2026;
        if (selectedYear === "2025") return y === 2025;
        if (selectedYear === "2024") return y === 2024;
        if (selectedYear === "2020s") return y >= 2020 && y <= 2023;
        if (selectedYear === "2010s") return y >= 2010 && y <= 2019;
        if (selectedYear === "classic") return y < 2010;
        return String(y) === selectedYear;
      });
    }

    // 4. Minimum IMDb rating filter
    if (minRating > 0) {
      list = list.filter((item) => {
        const r = item.rating ?? (item as any).imdbRating;
        return r !== null && r !== undefined && Number(r) >= minRating;
      });
    }

    // 5. Language / Audio filter
    if (selectedLang !== "all") {
      list = list.filter((item) => {
        const lang = (item.language || "").toLowerCase();
        if (selectedLang === "hindi") return lang.includes("hi") || lang.includes("hindi");
        if (selectedLang === "english") return lang.includes("en") || lang.includes("english");
        if (selectedLang === "south")
          return (
            lang.includes("ta") ||
            lang.includes("te") ||
            lang.includes("tamil") ||
            lang.includes("telugu") ||
            lang.includes("malayalam")
          );
        if (selectedLang === "japanese") return lang.includes("ja") || lang.includes("japanese");
        return true;
      });
    }

    // 6. Sorting
    if (sortBy === "rating") {
      list.sort((a, b) => {
        const rA = Number(a.rating ?? (a as any).imdbRating ?? 0);
        const rB = Number(b.rating ?? (b as any).imdbRating ?? 0);
        return rB - rA;
      });
    } else if (sortBy === "year_desc") {
      list.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    } else if (sortBy === "year_asc") {
      list.sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0));
    } else if (sortBy === "popularity") {
      list.sort(
        (a, b) => (b.viewCount || (b as any).views || 0) - (a.viewCount || (a as any).views || 0)
      );
    }

    return list;
  }, [rawResults, filterType, selectedGenre, selectedYear, minRating, selectedLang, sortBy]);

  return (
    <div className="min-h-screen bg-[#08080c] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. SEARCH INPUT & HEADER */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center space-y-1 mb-2">
          <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white uppercase">
            Search &amp; <span className="text-[#e50914]">Discover</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Find movies, web series, and anime with multi-filter precision.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) {
                window.history.replaceState(null, "", `/search?q=${encodeURIComponent(e.target.value.trim())}`);
              } else {
                window.history.replaceState(null, "", "/search");
              }
            }}
            placeholder="Search by title, character, actor, director..."
            autoFocus
            className="w-full bg-[#12121c] hover:bg-[#161624] focus:bg-[#161624] border border-white/10 focus:border-[#e50914] rounded-2xl py-4 pl-12 pr-24 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e50914]/40 shadow-2xl transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#e50914] transition-colors" />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {loading && (
              <Loader2 className="w-5 h-5 text-[#e50914] animate-spin" />
            )}
            {query && !loading && (
              <button
                onClick={() => {
                  setQuery("");
                  window.history.replaceState(null, "", "/search");
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trending Suggestions when query is short or empty */}
        {!query.trim() && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#e50914]" />
              <span>Popular Searches:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelectSuggestion(term)}
                  className="px-3 py-1.5 rounded-xl bg-[#141420] hover:bg-[#1e1e30] text-slate-300 hover:text-white text-xs font-medium border border-white/5 hover:border-white/20 transition-all cursor-pointer select-none"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. FORMAT PILLS & FILTER TOGGLE TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Format Tabs */}
          <div className="inline-flex items-center gap-1.5 bg-[#12121c] p-1 rounded-2xl border border-white/10">
            {[
              { id: "ALL", label: "All Formats", icon: Compass },
              { id: "MOVIE", label: "Movies", icon: Film },
              { id: "SERIES", label: "Web Series", icon: Tv },
              { id: "ANIME", label: "Anime", icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? "bg-[#e50914] text-white shadow-md shadow-red-600/30 scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Filters Toggle & Clear All */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filterPanelOpen || activeFilterCount > 0
                  ? "bg-[#e50914] text-white border-red-500 shadow-md shadow-red-600/30"
                  : "bg-[#141420] hover:bg-[#1e1e30] text-slate-300 hover:text-white border-white/10"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-black font-black text-[10px]">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  filterPanelOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/5 transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. EXPANDABLE FILTER OPTIONS PANEL */}
        {filterPanelOpen && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#11111a] border border-white/10 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Filter className="w-3.5 h-3.5 text-[#e50914]" />
                <span>Filter Options</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>

            {/* Grid of Filter Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Option 1: Genre Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  aria-label="Filter by genre"
                  className="w-full bg-[#181826] text-slate-200 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  <option value="all">All Genres</option>
                  {genres.map((g) => (
                    <option key={g.id || g.slug} value={g.slug}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option 2: Release Year Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Release Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Filter by release year"
                  className="w-full bg-[#181826] text-slate-200 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {YEAR_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option 3: Minimum IMDb Rating */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  aria-label="Filter by minimum rating"
                  className="w-full bg-[#181826] text-slate-200 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {RATING_OPTIONS.map((r) => (
                    <option key={r.val} value={r.val}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Option 4: Sort Results By */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sort Results By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort results by"
                  className="w-full bg-[#181826] text-slate-200 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language Strip Filter */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Audio / Language:
              </span>
              {LANGUAGE_OPTIONS.map((lang) => {
                const isActive = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                      isActive
                        ? "bg-[#e50914] text-white shadow-sm"
                        : "bg-[#181826] hover:bg-[#202035] text-slate-300 hover:text-white border border-white/5"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filter Chips (if any active) */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-medium">Applied Filters:</span>
            {filterType !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 text-xs font-semibold text-[#e50914]">
                <span>Type: {filterType}</span>
                <button onClick={() => setFilterType("ALL")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedGenre !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 text-xs font-semibold text-[#e50914]">
                <span>Genre: {selectedGenre}</span>
                <button onClick={() => setSelectedGenre("all")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedYear !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 text-xs font-semibold text-[#e50914]">
                <span>Year: {selectedYear}</span>
                <button onClick={() => setSelectedYear("all")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 text-xs font-semibold text-[#e50914]">
                <span>Rating: {minRating}+ Stars</span>
                <button onClick={() => setMinRating(0)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLang !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 text-xs font-semibold text-[#e50914]">
                <span>Lang: {selectedLang}</span>
                <button onClick={() => setSelectedLang("all")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== "relevance" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-400">
                <span>Sorted by: {sortBy}</span>
                <button onClick={() => setSortBy("relevance")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. RESULTS HEADER */}
      {query.trim() && (
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
            <p className="text-xs sm:text-sm text-slate-300">
              Results for &quot;<span className="text-white font-bold">{query}</span>&quot;
              {activeFilterCount > 0 && (
                <span className="text-slate-400 font-normal">
                  {" "}({filteredResults.length} matches from {rawResults.length} total)
                </span>
              )}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {filteredResults.length} {filteredResults.length === 1 ? "Title" : "Titles"} Found
          </span>
        </div>
      )}

      {/* 5. RESULTS GRID */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#e50914] animate-ping" />
            <span>Finding matching titles across movies and web series...</span>
          </div>
          <MovieGridSkeleton count={12} />
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredResults.map((item) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      ) : query.trim() && !loading ? (
        <div className="py-24 text-center space-y-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">No Matching Titles Found</h3>
          <p className="text-xs text-slate-400">
            {activeFilterCount > 0
              ? "None of the results matched your active filter options. Try clearing some filters to broaden your search."
              : "Try searching by partial title, actor name, or different spelling."}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : !query.trim() ? (
        <div className="py-24 text-center space-y-3 max-w-md mx-auto text-slate-500">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-white">Ready to Explore</h3>
          <p className="text-xs text-slate-400">
            Type any movie, TV series, or anime above to instantly search with advanced filtering options.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080c] pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-12 w-full bg-white/5 rounded-2xl skeleton-shimmer" />
          <MovieGridSkeleton count={12} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

