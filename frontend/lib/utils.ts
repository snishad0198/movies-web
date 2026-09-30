import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatRating(rating?: number | null): string {
  if (rating === undefined || rating === null) return "N/A";
  return rating.toFixed(1);
}

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}

const DEFAULT_PLACEHOLDER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600' fill='%2314141c'%3E%3Crect width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23e50914' font-family='sans-serif' font-size='24' font-weight='bold'%3ESNISHAD%3C/text%3E%3C/svg%3E";

export function getImageUrl(path?: string | null, fallback = DEFAULT_PLACEHOLDER): string {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `https://image.tmdb.org/t/p/original${path}`;
  }
  return path;
}
