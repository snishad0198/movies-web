import React from "react";
import { redirect } from "next/navigation";
import { getMovieBySlug, getSeriesBySlug } from "@/lib/api";
import { WatchPlayerView } from "@/components/watch/WatchPlayerView";
import { MovieItem } from "@/lib/types";

export const dynamic = "force-dynamic";

interface WatchQueryPageProps {
  searchParams: {
    id?: string;
    slug?: string;
    type?: string;
    season?: string;
    episode?: string;
  };
}

export default async function WatchQueryPage({ searchParams }: WatchQueryPageProps) {
  const { id, slug, type, season = "1", episode = "1" } = searchParams;

  if (slug) {
    const isSeries = type === "tv" || type === "series";
    const q = isSeries ? `?season=${season}&episode=${episode}` : "";
    redirect(`/watch/${slug}${q}`);
  }

  if (!id) {
    redirect("/");
  }

  const isTv = type === "tv" || type === "series";
  let item: MovieItem | null = null;

  if (isTv) {
    item = await getSeriesBySlug(id);
  } else {
    item = await getMovieBySlug(id);
  }

  if (item?.slug) {
    const q = isTv ? `?season=${season}&episode=${episode}` : "";
    redirect(`/watch/${item.slug}${q}`);
  }

  // Construct a minimal playable item if slug not found
  const fallbackItem: MovieItem = {
    id: parseInt(id, 10) || 1,
    tmdbId: id,
    title: isTv ? `Series (#${id})` : `Movie (#${id})`,
    slug: id,
    type: isTv ? "SERIES" : "MOVIE",
    overview: "Stream in high-speed cloud player.",
  };

  return (
    <WatchPlayerView
      item={item || fallbackItem}
      initialSeason={parseInt(season, 10) || 1}
      initialEpisode={parseInt(episode, 10) || 1}
    />
  );
}
