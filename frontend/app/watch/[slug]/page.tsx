import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieBySlug, getSeriesBySlug, getTrending } from "@/lib/api";
import { WatchPlayerView } from "@/components/watch/WatchPlayerView";
import { MovieItem } from "@/lib/types";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    season?: string;
    episode?: string;
    type?: string;
  };
}

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  let item: MovieItem | null = null;
  const isSeriesParam =
    searchParams.type === "series" ||
    searchParams.type === "tv" ||
    Boolean(searchParams.season) ||
    Boolean(searchParams.episode);

  if (isSeriesParam) {
    item = await getSeriesBySlug(params.slug);
    if (!item) item = await getMovieBySlug(params.slug);
  } else {
    item = await getMovieBySlug(params.slug);
    if (!item) item = await getSeriesBySlug(params.slug);
  }

  if (!item) {
    return { title: "Watch Stream | Movies.snishad" };
  }

  const s = parseInt(searchParams.season || "1", 10);
  const e = parseInt(searchParams.episode || "1", 10);
  const epText = item.type === "SERIES" || isSeriesParam ? ` Season ${s} Episode ${e}` : "";

  return {
    title: `Watch ${item.title}${epText} Online in Ultra-HD | Movies.snishad`,
    description: item.overview || `Stream and download ${item.title} in Full HD 1080p and 4K on Movies.snishad.`,
  };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  let item: MovieItem | null = null;
  const isSeriesParam =
    searchParams.type === "series" ||
    searchParams.type === "tv" ||
    Boolean(searchParams.season) ||
    Boolean(searchParams.episode);

  if (isSeriesParam) {
    item = await getSeriesBySlug(params.slug);
    if (!item) item = await getMovieBySlug(params.slug);
  } else {
    item = await getMovieBySlug(params.slug);
    if (!item) item = await getSeriesBySlug(params.slug);
  }

  if (!item) {
    notFound();
  }

  if (isSeriesParam && item.type !== "SERIES") {
    item.type = "SERIES";
  }

  const season = Math.max(1, parseInt(searchParams.season || "1", 10));
  const episode = Math.max(1, parseInt(searchParams.episode || "1", 10));

  // Get similar items from item.related or trending
  let related = item.related || [];
  if (related.length === 0) {
    try {
      const trending = await getTrending({ limit: 12 });
      related = trending.filter((t) => t.slug !== item?.slug);
    } catch {
      related = [];
    }
  }

  return (
    <WatchPlayerView
      item={item}
      initialSeason={season}
      initialEpisode={episode}
      related={related}
    />
  );
}
