import { cache } from "react";
import { HomepageData, MovieItem, Genre, SiteSettings } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY || process.env.BACKEND_API_KEY || "movies-snishad-secure-internal-token-2026";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export function normalizeMovie(m: any): MovieItem {
  if (!m || typeof m !== "object") return m;
  const poster = m.poster || m.posterPath || null;
  const backdrop = m.backdrop || m.backdropPath || poster;
  const overview = m.description || m.overview || "";
  const rating = m.imdbRating !== undefined && m.imdbRating !== null ? Number(m.imdbRating) : (m.rating !== undefined ? Number(m.rating) : null);
  const views = m.viewCount !== undefined ? Number(m.viewCount) : (m.views !== undefined ? Number(m.views) : 0);

  return {
    ...m,
    poster,
    posterPath: poster,
    backdrop,
    backdropPath: backdrop,
    overview,
    description: overview,
    rating,
    imdbRating: rating,
    views,
    viewCount: views,
    downloadCount: m.downloadCount !== undefined ? Number(m.downloadCount) : 0,
    seasons: Array.isArray(m.seasons)
      ? m.seasons.map((s: any) => ({
          ...s,
          seasonNum: s.seasonNumber ?? s.seasonNum ?? 1,
          seasonNumber: s.seasonNumber ?? s.seasonNum ?? 1,
          episodes: Array.isArray(s.episodes)
            ? s.episodes.map((ep: any) => ({
                ...ep,
                episodeNum: ep.episodeNumber ?? ep.episodeNum ?? 1,
                episodeNumber: ep.episodeNumber ?? ep.episodeNum ?? 1,
                overview: ep.description || ep.overview || "",
                description: ep.description || ep.overview || "",
              }))
            : [],
        }))
      : m.seasons,
  };
}

export async function fetchBackend<T>(endpoint: string, options: FetchOptions = {}): Promise<T | null> {
  try {
    let url: string;
    if (typeof window !== "undefined") {
      const cleanEndpoint = endpoint.startsWith("/api") ? endpoint.replace(/^\/api/, "") : endpoint;
      url = `/api/proxy${cleanEndpoint}`;
    } else {
      url = `${BACKEND_URL}${endpoint}`;
    }

    if (options.params) {
      const query = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== "") {
          query.append(key, String(val));
        }
      });
      const qStr = query.toString();
      if (qStr) url += `?${qStr}`;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      cache: options.cache || "no-store",
      ...options,
      headers,
    });

    if (!res.ok) {
      console.warn(`[Backend API] ${endpoint} returned status ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json && json.pagination !== undefined) {
      return json;
    }
    return json.success !== undefined ? (json.data ?? json) : json;
  } catch (error) {
    console.error(`[Backend API Error] ${endpoint}:`, error);
    return null;
  }
}

// Homepage data (Hero + Curated Rows with Region Trending)
export async function getHomepage(params: { region?: string; headers?: Record<string, string> } = {}): Promise<HomepageData | null> {
  const data = await fetchBackend<HomepageData>("/api/homepage", {
    params: params.region ? { region: params.region } : undefined,
    headers: params.headers,
    cache: "no-store",
  });
  if (!data) return null;
  return {
    userRegion: data.userRegion,
    hero: (data.hero || []).map(normalizeMovie),
    rows: (data.rows || []).map((r) => ({
      ...r,
      items: (r.items || []).map(normalizeMovie),
    })),
  };
}

// Movies Catalog
export async function getMovies(params: {
  page?: number;
  limit?: number;
  category?: string;
  genre?: string;
  year?: number;
  yearRange?: string;
  language?: string;
  sort?: string;
} = {}): Promise<{ movies: MovieItem[]; pagination: any } | null> {
  const data = await fetchBackend<any>("/api/movies", { params });
  if (!data) return null;
  const list = Array.isArray(data) ? data : data.data || data.movies || [];
  return {
    movies: list.map(normalizeMovie),
    pagination: data.pagination || { total: list.length, page: 1, limit: 20, totalPages: 1 },
  };
}

// Single Movie by Slug (Deduplicated across generateMetadata and Page render)
export const getMovieBySlug = cache(async (slug: string): Promise<MovieItem | null> => {
  const data = await fetchBackend<any>(`/api/movies/${encodeURIComponent(slug)}`);
  return data ? normalizeMovie(data) : null;
});

// Series Catalog
export async function getSeries(params: {
  page?: number;
  limit?: number;
  category?: string;
  genre?: string;
  sort?: string;
} = {}): Promise<{ series: MovieItem[]; pagination: any } | null> {
  const data = await fetchBackend<any>("/api/series", { params });
  if (!data) return null;
  const list = Array.isArray(data) ? data : data.data || data.series || [];
  return {
    series: list.map(normalizeMovie),
    pagination: data.pagination || { total: list.length, page: 1, limit: 20, totalPages: 1 },
  };
}

// Single Series by Slug (Deduplicated across generateMetadata and Page render)
export const getSeriesBySlug = cache(async (slug: string): Promise<MovieItem | null> => {
  const data = await fetchBackend<any>(`/api/series/${encodeURIComponent(slug)}`);
  return data ? normalizeMovie(data) : null;
});

// Trending Catalog (Region-Aware)
export async function getTrending(params: { region?: string; limit?: number; headers?: Record<string, string> } = {}): Promise<MovieItem[]> {
  const data = await fetchBackend<any>("/api/trending", {
    params: {
      ...(params.region ? { region: params.region } : {}),
      ...(params.limit ? { limit: params.limit } : {}),
    },
    headers: params.headers,
    cache: "no-store",
  });
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map(normalizeMovie);
}

// New Releases
export async function getNewReleases(): Promise<MovieItem[]> {
  const data = await fetchBackend<any>("/api/new");
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map(normalizeMovie);
}

// Search
export async function searchTitles(q: string, type?: string): Promise<MovieItem[]> {
  if (!q.trim()) return [];
  const data = await fetchBackend<any>("/api/search", {
    params: { q, type },
    cache: "no-store",
  });
  const list = Array.isArray(data) ? data : data?.data || [];
  return list.map(normalizeMovie);
}

// Genres
export async function getGenres(): Promise<Genre[]> {
  const data = await fetchBackend<Genre[]>("/api/genres");
  return Array.isArray(data) ? data : (data as any)?.data || [];
}

// Site Settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
  return fetchBackend<SiteSettings>("/api/settings");
}

// Download Links Proxy
export async function fetchDownloadLinks(params: {
  title: string;
  year?: number;
  season?: number;
  episode?: number;
  movieId?: number;
}) {
  return fetchBackend<any>("/api/download", {
    params: params as any,
    cache: "no-store",
  });
}

// Track Download Click
export async function trackDownload(downloadId: number, quality: string) {
  try {
    const url = typeof window !== "undefined" ? "/api/proxy/download/track" : `${BACKEND_URL}/api/download/track`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ downloadId, quality }),
    });
  } catch (e) {
    // silent catch
  }
}

// Record View
export async function recordView(movieId: number) {
  try {
    const url = typeof window !== "undefined" ? "/api/proxy/view" : `${BACKEND_URL}/api/view`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ movieId }),
    });
  } catch (e) {
    // silent catch
  }
}

export interface SiteSettingsData {
  siteName: string;
  tagline: string;
  logo: string;
  favicon: string;
  footerText: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  announcementText?: string;
  announcementLink?: string;
  announcementActive: boolean;
  customLinks?: string;
  layoutStyle?: string;
}

let cachedSettingsInMemory: SiteSettingsData | null = null;
let lastSettingsFetch = 0;

// Get Public Site Settings (Fast In-Memory Cache + Request Deduplication)
export const getSettings = cache(async (): Promise<SiteSettingsData> => {
  const now = Date.now();
  if (cachedSettingsInMemory && now - lastSettingsFetch < 60000) {
    return cachedSettingsInMemory;
  }

  const data = await fetchBackend<SiteSettingsData>("/api/settings");
  const result: SiteSettingsData = {
    siteName: data?.siteName || "Movies.snishad",
    tagline: data?.tagline || "Watch & Download Free HD Movies & Series",
    logo: data?.logo || "/logo.jpg",
    favicon: data?.favicon || "/favicon.ico",
    footerText: data?.footerText || "Movies.snishad is a premier entertainment index.",
    primaryColor: data?.primaryColor || "#e50914",
    accentColor: data?.accentColor || "#ff1f2d",
    backgroundColor: data?.backgroundColor || "#08080c",
    cardColor: data?.cardColor || "#121218",
    textColor: data?.textColor || "#f8fafc",
    announcementText: data?.announcementText,
    announcementLink: data?.announcementLink,
    announcementActive: Boolean(data?.announcementActive),
    customLinks: data?.customLinks || "[]",
    layoutStyle: data?.layoutStyle || "modern",
  };
  cachedSettingsInMemory = result;
  lastSettingsFetch = now;
  return result;
});

// Dedicated Anime Catalog
export async function getAnime(params: {
  category?: string;
  page?: number;
} = {}): Promise<{ anime: MovieItem[]; pagination: any } | null> {
  const data = await fetchBackend<any>("/api/anime", { params });
  if (!data) return null;
  const list = Array.isArray(data) ? data : data.data || [];
  return {
    anime: list.map(normalizeMovie),
    pagination: data.pagination || { page: 1, totalPages: 1, hasMore: false },
  };
}

export interface WatchServerItem {
  id: string;
  name: string;
  tag: string;
  quality: string;
  color: string;
  provider: string;
  url: string;
  isCustom?: boolean;
}

export interface WatchServersResponse {
  success: boolean;
  tmdbId: string;
  type: string;
  totalChecked: number;
  workingCount: number;
  hasWorkingServers: boolean;
  servers: WatchServerItem[];
  categoryRecommendations: MovieItem[];
}

export async function getWatchServers(params: {
  tmdbId: string;
  type: string;
  season?: number;
  episode?: number;
  slug?: string;
}): Promise<WatchServersResponse | null> {
  const data = await fetchBackend<WatchServersResponse>("/api/watch/servers", {
    params: {
      tmdbId: params.tmdbId,
      type: params.type,
      season: params.season,
      episode: params.episode,
      slug: params.slug,
    },
  });
  if (!data) return null;
  return {
    ...data,
    categoryRecommendations: (data.categoryRecommendations || []).map(normalizeMovie),
  };
}
