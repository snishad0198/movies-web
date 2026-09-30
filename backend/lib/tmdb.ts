import { db } from "./db";

const TMDB_SERVERS = [
  "https://api.tmdb.org/3",
  "https://api.themoviedb.org/3",
];

// In-memory cached key with 30s TTL to prevent hitting DB on every request
let cachedTmdbKey: string | null = null;
let lastKeyFetch = 0;

/**
 * Returns active TMDB API key:
 * 1. Checks site_settings table in database (configured via Admin Settings)
 * 2. Falls back to process.env.TMDB_API_KEY
 */
export async function getActiveTmdbApiKey(): Promise<string> {
  const now = Date.now();
  if (cachedTmdbKey !== null && now - lastKeyFetch < 30000) {
    return cachedTmdbKey;
  }

  try {
    const row = await db.siteSetting.findUnique({
      where: { id: "1" },
      select: { tmdbApiKey: true },
    });
    if (row?.tmdbApiKey && row.tmdbApiKey.trim()) {
      cachedTmdbKey = row.tmdbApiKey.trim();
      lastKeyFetch = now;
      return cachedTmdbKey;
    }
  } catch (e) {
    // Database fallback
  }

  const envKey = (process.env.TMDB_API_KEY || "").trim();
  cachedTmdbKey = envKey;
  lastKeyFetch = now;
  return cachedTmdbKey;
}

export function invalidateTmdbKeyCache() {
  cachedTmdbKey = null;
  lastKeyFetch = 0;
}

// Simple in-memory cache to guarantee sub-50ms responses and prevent rate-limiting
interface CacheEntry {
  expiresAt: number;
  data: any;
}
const tmdbCache = new Map<string, CacheEntry>();

export async function fetchFromTmdb(
  endpoint: string,
  params: Record<string, string> = {},
  cacheTtlMs = 60 * 60 * 1000 // 1 hour hourly fresh refresh by default
): Promise<any> {
  const apiKey = await getActiveTmdbApiKey();
  if (!apiKey || apiKey === "your-tmdb-api-key-here") {
    console.warn(
      "[TMDB Warning] No valid TMDB API key found. Please configure your free TMDB API key in Backend Admin Settings (/admin/settings) or set TMDB_API_KEY in .env"
    );
  }

  const finalParams: Record<string, string> = {
    api_key: apiKey || "",
    include_adult: "false",
    ...params,
  };

  const cacheKey = `${endpoint}?${new URLSearchParams(finalParams).toString()}`;
  const cached = tmdbCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const query = new URLSearchParams(finalParams).toString();

  for (const baseUrl of TMDB_SERVERS) {
    try {
      const url = `${baseUrl}/${endpoint.replace(/^\//, "")}?${query}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        // Cache for 1 hour (refreshes every hour fresh)
        tmdbCache.set(cacheKey, {
          expiresAt: Date.now() + cacheTtlMs,
          data,
        });
        return data;
      }
    } catch (e) {
      // Fallback to next server or cache
    }
  }

  // If live fetch fails, return expired cache if available instead of throwing
  if (cached) {
    return cached.data;
  }

  throw new Error(`Failed to fetch from TMDB endpoint: ${endpoint}`);
}

const LANG_MAP: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  pa: "Punjabi",
  bn: "Bengali",
  ko: "Korean",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  zh: "Chinese",
};

export function formatTmdbItem(item: any, forceType?: "MOVIE" | "SERIES") {
  const isSeries = forceType ? forceType === "SERIES" : (item.media_type === "tv" || !item.title);
  const title = item.title || item.name || "Untitled";
  const dateStr = item.release_date || item.first_air_date || "";
  const releaseYear = dateStr ? parseInt(dateStr.substring(0, 4), 10) : new Date().getFullYear();
  const tmdbId = String(item.id);
  const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = `${rawSlug || "title"}-${tmdbId}`;

  const langCode = item.original_language || "hi";
  const language = LANG_MAP[langCode] || langCode.toUpperCase();
  const isAdult = Boolean(item.adult);

  return {
    id: item.id,
    tmdbId,
    title,
    slug,
    type: isSeries ? ("SERIES" as const) : ("MOVIE" as const),
    adult: isAdult,
    isAdult,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
    backdrop: item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : (item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : ""),
    description: item.overview || "Stream in 4K Ultra-HD with multiple high-speed servers and direct download links on Movies.snishad.",
    releaseYear,
    runtime: item.runtime || 120,
    imdbRating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 8.0,
    language,
    viewCount: Math.round((item.popularity || 50) * 120) || 12000,
    genres: (item.genre_ids || []).map((gid: number) => ({
      id: gid,
      name: getGenreNameById(gid),
      slug: getGenreNameById(gid).toLowerCase(),
      color: "#e50914",
    })),
  };
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10765: "Sci-Fi & Fantasy",
};

function getGenreNameById(id: number): string {
  return GENRE_MAP[id] || "Cinema";
}

export function getGenreIdByName(slugOrName: string): number | undefined {
  const norm = slugOrName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [id, name] of Object.entries(GENRE_MAP)) {
    if (name.toLowerCase().replace(/[^a-z0-9]/g, "") === norm) {
      return Number(id);
    }
  }
  return undefined;
}

// Exactly mirror the categories used in the original PHP site
export const TMDB_CATEGORIES: Record<
  string,
  { endpoint: string; params: Record<string, string>; type: "MOVIE" | "SERIES"; title: string; showRank?: boolean }
> = {
  trending: {
    endpoint: "trending/all/day",
    params: { region: "IN", with_original_language: "hi|en" },
    type: "MOVIE",
    title: "Top Trending in India",
    showRank: true,
  },
  indian_new: {
    endpoint: "discover/movie",
    params: { region: "IN", with_original_language: "hi", "primary_release_date.gte": "2024-01-01", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "New Indian Blockbusters (Bollywood)",
  },
  indian_series: {
    endpoint: "discover/tv",
    params: { region: "IN", with_original_language: "hi", sort_by: "popularity.desc" },
    type: "SERIES",
    title: "Top Indian Web Series",
  },
  south_all: {
    endpoint: "discover/movie",
    params: { region: "IN", with_original_language: "te|ta|ml|kn", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "South Indian Action Hits",
  },
  hollywood: {
    endpoint: "discover/movie",
    params: { region: "IN", with_original_language: "en", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "Hollywood Blockbusters",
  },
  holywood_series: {
    endpoint: "discover/tv",
    params: { region: "IN", with_original_language: "en", sort_by: "popularity.desc" },
    type: "SERIES",
    title: "Global English Web Series",
  },
  anime: {
    endpoint: "discover/tv",
    params: { region: "IN", with_genres: "16", with_original_language: "ja", sort_by: "popularity.desc" },
    type: "SERIES",
    title: "Anime Universe",
  },
  upcoming: {
    endpoint: "discover/movie",
    params: { primary_release_year: "2026", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "Upcoming 2026 Hits",
  },
  year_2025: {
    endpoint: "discover/movie",
    params: { primary_release_year: "2025", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "Latest 2025 Releases",
  },
  indian_horror: {
    endpoint: "discover/movie",
    params: { region: "IN", with_original_language: "hi", with_genres: "27", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "Indian Horror Thrills",
  },
  classic_old: {
    endpoint: "discover/movie",
    params: { region: "IN", with_original_language: "hi|en", "primary_release_date.lte": "2015-01-01", sort_by: "popularity.desc" },
    type: "MOVIE",
    title: "Classic & Vintage Cinema",
  },
};

export async function getCategoryItems(catKey: string, page = 1) {
  const config = TMDB_CATEGORIES[catKey];
  if (!config) return [];

  try {
    const data = await fetchFromTmdb(config.endpoint, {
      ...config.params,
      page: String(page),
    });

    const results = data.results || [];
    return results
      .filter((item: any) => Boolean(item.poster_path || item.backdrop_path))
      .map((item: any) => formatTmdbItem(item, config.type));
  } catch (err) {
    console.error(`Failed to fetch category ${catKey}:`, err);
    return [];
  }
}

export async function getTrendingByRegion(regionCode: string, page = 1) {
  try {
    const code = (regionCode || "IN").toUpperCase();
    const isIndia = code === "IN";
    const isGlobal = code === "GLOBAL";

    // Current era time filters to ensure strictly modern active hits (2024-2026)
    const currentMovieDate = "2024-01-01";
    const currentSeriesDate = "2023-01-01";

    if (isIndia) {
      // Query Indian cinema & web series released in current time window
      const [moviesData, seriesData] = await Promise.all([
        fetchFromTmdb("discover/movie", {
          region: "IN",
          with_origin_country: "IN",
          with_original_language: "hi|te|ta|ml|kn|pa",
          sort_by: "popularity.desc",
          "primary_release_date.gte": currentMovieDate,
          page: String(page),
        }).catch(() => ({ results: [] })),
        fetchFromTmdb("discover/tv", {
          with_origin_country: "IN",
          with_original_language: "hi|te|ta|ml|kn",
          sort_by: "popularity.desc",
          "first_air_date.gte": currentSeriesDate,
          "air_date.gte": "2024-01-01",
          page: String(page),
        }).catch(() => ({ results: [] })),
      ]);

      const rawMovies = (moviesData.results || []).map((m: any) => formatTmdbItem(m, "MOVIE"));
      const rawSeries = (seriesData.results || []).map((s: any) => formatTmdbItem(s, "SERIES"));

      // Interleave movies and series so the trending list has high-energy variety
      const combined: any[] = [];
      const maxLen = Math.max(rawMovies.length, rawSeries.length);
      const seenIds = new Set<string>();

      for (let i = 0; i < maxLen; i++) {
        if (i < rawMovies.length && !seenIds.has(String(rawMovies[i].id))) {
          seenIds.add(String(rawMovies[i].id));
          combined.push(rawMovies[i]);
        }
        if (i < rawSeries.length && !seenIds.has(String(rawSeries[i].id))) {
          seenIds.add(String(rawSeries[i].id));
          combined.push(rawSeries[i]);
        }
      }

      return combined
        .filter((item: any) => Boolean(item.poster || item.backdrop))
        .filter((item: any) => !item.releaseYear || item.releaseYear >= 2023);
    }

    if (isGlobal) {
      const data = await fetchFromTmdb("trending/all/day", { page: String(page) }).catch(() => ({ results: [] }));
      const results = data.results || [];
      return results
        .filter((item: any) => Boolean(item.poster_path || item.backdrop_path))
        .map((item: any) => formatTmdbItem(item))
        .filter((item: any) => !item.releaseYear || item.releaseYear >= 2023);
    }

    // Country-specific (US, GB, CA, AU, AE, etc.)
    const [movieData, tvData] = await Promise.all([
      fetchFromTmdb("discover/movie", {
        region: code,
        sort_by: "popularity.desc",
        "primary_release_date.gte": currentMovieDate,
        page: String(page),
      }).catch(() => ({ results: [] })),
      fetchFromTmdb("discover/tv", {
        watch_region: code,
        sort_by: "popularity.desc",
        "first_air_date.gte": currentSeriesDate,
        "air_date.gte": "2024-01-01",
        page: String(page),
      }).catch(() => ({ results: [] })),
    ]);

    const rawMovies = (movieData.results || []).map((m: any) => formatTmdbItem(m, "MOVIE"));
    const rawSeries = (tvData.results || []).map((s: any) => formatTmdbItem(s, "SERIES"));

    const combined: any[] = [];
    const maxLen = Math.max(rawMovies.length, rawSeries.length);
    const seenIds = new Set<string>();
    for (let i = 0; i < maxLen; i++) {
      if (i < rawMovies.length && !seenIds.has(String(rawMovies[i].id))) {
        seenIds.add(String(rawMovies[i].id));
        combined.push(rawMovies[i]);
      }
      if (i < rawSeries.length && !seenIds.has(String(rawSeries[i].id))) {
        seenIds.add(String(rawSeries[i].id));
        combined.push(rawSeries[i]);
      }
    }

    if (combined.length < 5) {
      const fallback = await fetchFromTmdb("trending/all/day", { page: String(page) }).catch(() => ({ results: [] }));
      return (fallback.results || [])
        .filter((item: any) => Boolean(item.poster_path || item.backdrop_path))
        .map((item: any) => formatTmdbItem(item))
        .filter((item: any) => !item.releaseYear || item.releaseYear >= 2023);
    }

    return combined
      .filter((item: any) => Boolean(item.poster || item.backdrop))
      .filter((item: any) => !item.releaseYear || item.releaseYear >= 2023);
  } catch (err) {
    console.error(`Failed to fetch trending for region ${regionCode}:`, err);
    return [];
  }
}

export async function searchTmdb(query: string, type?: string, page = 1) {
  try {
    const endpoint = type === "SERIES" ? "search/tv" : type === "MOVIE" ? "search/movie" : "search/multi";
    const data = await fetchFromTmdb(endpoint, {
      query,
      page: String(page),
      include_adult: "false",
    });

    return (data.results || [])
      .filter((item: any) => Boolean(item.poster_path || item.backdrop_path))
      .map((item: any) => formatTmdbItem(item));
  } catch (e) {
    console.error("TMDB search failed:", e);
    return [];
  }
}

export async function getTmdbFullDetails(idOrSlug: string, isTv = false) {
  // Extract numeric TMDB ID from slug if necessary (e.g. "gandhari-12345" -> "12345")
  let cleanId = idOrSlug;
  const match = idOrSlug.match(/-?(\d+)$/);
  if (match) {
    cleanId = match[1];
  }

  const type = isTv ? "tv" : "movie";
  try {
    const details = await fetchFromTmdb(`${type}/${cleanId}`, {
      append_to_response: "credits,videos,similar,external_ids",
    });

    const title = details.title || details.name || "Untitled";
    const date = details.release_date || details.first_air_date || "";
    const releaseYear = date ? parseInt(date.substring(0, 4), 10) : new Date().getFullYear();
    const runtime = details.runtime || (details.episode_run_time && details.episode_run_time[0]) || 120;
    const imdbId = details.external_ids?.imdb_id || details.imdb_id || null;

    // Cast list
    const cast = (details.credits?.cast || []).slice(0, 10).map((c: any) => ({
      name: c.name,
      role: c.character || "Cast",
      photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : undefined,
    }));

    // Director
    const directorObj = (details.credits?.crew || []).find((c: any) => c.job === "Director");
    const director = directorObj?.name || (details.created_by && details.created_by[0]?.name) || "Director";

    // Trailer
    const videos = details.videos?.results || [];
    const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || videos[0];
    const trailerUrl = trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

    // Genres
    const genres = (details.genres || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      slug: g.name.toLowerCase(),
      color: "#e50914",
    }));

    // Similar
    const similar = (details.similar?.results || [])
      .slice(0, 6)
      .filter((s: any) => Boolean(s.poster_path))
      .map((s: any) => formatTmdbItem(s, isTv ? "SERIES" : "MOVIE"));

    // TV Seasons & Episodes
    let seasons: any[] = [];
    if (isTv && Array.isArray(details.seasons)) {
      seasons = details.seasons
        .filter((s: any) => s.season_number > 0)
        .map((s: any) => ({
          id: s.id,
          seasonNumber: s.season_number,
          seasonNum: s.season_number,
          title: s.name || `Season ${s.season_number}`,
          year: s.air_date ? parseInt(s.air_date.substring(0, 4), 10) : releaseYear,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
          episodes: [],
        }));
    }

    const langCode = details.original_language || "hi";
    const language = LANG_MAP[langCode] || langCode.toUpperCase();

    return {
      id: details.id,
      tmdbId: String(details.id),
      imdbId,
      title,
      slug: idOrSlug,
      type: isTv ? ("SERIES" as const) : ("MOVIE" as const),
      poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "",
      backdrop: details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : (details.poster_path ? `https://image.tmdb.org/t/p/original${details.poster_path}` : ""),
      description: details.overview || "Stream in 4K Ultra-HD with multiple high-speed servers and direct download links on Movies.snishad.",
      releaseYear,
      runtime,
      director,
      cast,
      trailerUrl,
      language,
      imdbRating: details.vote_average ? Number(details.vote_average.toFixed(1)) : 8.0,
      viewCount: Math.round((details.popularity || 100) * 150) || 25000,
      genres,
      related: similar,
      seasons,
    };
  } catch (err) {
    console.warn(`Failed to fetch TMDB details for ${type} ${cleanId}:`, err);
    return null;
  }
}

export async function getTmdbTvSeasonEpisodes(tvId: string, seasonNum: number) {
  try {
    const data = await fetchFromTmdb(`tv/${tvId}/season/${seasonNum}`);
    return (data.episodes || []).map((ep: any) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      episodeNum: ep.episode_number,
      title: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || "",
      description: ep.overview || "",
      thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
      duration: ep.runtime || 35,
    }));
  } catch (e) {
    console.error(`Failed to fetch season ${seasonNum} for TV ${tvId}:`, e);
    return [];
  }
}

/**
 * Dedicated Anime Catalog
 * Guaranteed to only return authentic Japanese Anime content with subcategories
 */
export async function getAnimeCatalog(category: string = "all", page = 1) {
  try {
    let endpoint = "discover/tv";
    let type: "MOVIE" | "SERIES" = "SERIES";
    let params: Record<string, string> = {
      with_genres: "16",
      with_original_language: "ja",
      sort_by: "popularity.desc",
      include_adult: "false",
      page: String(page),
    };

    switch (category) {
      case "movies":
        endpoint = "discover/movie";
        type = "MOVIE";
        params["vote_count.gte"] = "20";
        break;
      case "action":
        params.with_genres = "16,10759";
        params["vote_count.gte"] = "15";
        break;
      case "isekai":
      case "fantasy":
        params.with_genres = "16,10765";
        params["vote_count.gte"] = "15";
        break;
      case "romance":
        params.with_genres = "16,35";
        params["vote_count.gte"] = "15";
        break;
      case "supernatural":
      case "dark_fantasy":
        params.with_genres = "16,9648";
        params["vote_count.gte"] = "10";
        break;
      case "top_rated":
        params.sort_by = "vote_average.desc";
        params["vote_count.gte"] = "100";
        break;
      default:
        // "all" - Popular Trending Anime
        params["vote_count.gte"] = "25";
        break;
    }

    const data = await fetchFromTmdb(endpoint, params);
    const results = (data.results || [])
      .filter((item: any) => Boolean(item.poster_path || item.backdrop_path))
      .map((item: any) => formatTmdbItem(item, type));

    return results;
  } catch (err) {
    console.error(`Failed to fetch anime catalog for category ${category}:`, err);
    return [];
  }
}

export async function importTmdbDetails(tmdbId: string, type: "tv" | "movie" = "movie") {
  return getTmdbFullDetails(tmdbId, type === "tv");
}
