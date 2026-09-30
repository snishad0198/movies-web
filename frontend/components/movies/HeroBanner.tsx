"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Info, Star, Volume2, VolumeX, X } from "lucide-react";
import { MovieItem } from "@/lib/types";
import { formatRating, formatDuration, getImageUrl } from "@/lib/utils";
import { LazyImage } from "@/components/ui/LazyImage";

interface HeroBannerProps {
  items: MovieItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const isSeries = current.type === "SERIES";
  const detailHref = isSeries ? `/series/${current.slug}` : `/movie/${current.slug}`;
  const watchHref = `/watch/${current.slug}${isSeries ? "?season=1&episode=1" : ""}`;
  const backdropUrl = getImageUrl(current.backdropPath || (current as any).backdrop || current.posterPath || (current as any).poster);
  const rating = current.rating ?? (current as any).imdbRating;

  // Extract YouTube ID if trailerUrl is present
  const getYouTubeEmbed = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
  };
  const trailerEmbed = getYouTubeEmbed(current.trailerUrl);

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] h-[82vh] lg:h-[88vh] bg-black overflow-hidden select-none">
      {/* Backdrop Image with Transitions */}
      <div className="absolute inset-0">
        <LazyImage
          key={current.id || currentIndex}
          src={backdropUrl}
          alt={current.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-60 transition-opacity duration-1000"
          fallbackText={current.title}
        />
        {/* Cinema Vignette Gradients */}
        {/* Top protective gradient ensuring fixed navbar is always distinct and never collides */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#08080c] via-[#08080c]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080c] via-[#08080c]/70 to-transparent w-full md:w-3/4 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-transparent to-[#08080c]/40 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#08080c] to-transparent z-10 pointer-events-none" />
      </div>

      {/* Hero Content Container with guaranteed top clearance for fixed header */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl space-y-3.5">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#e50914] text-white shadow-sm">
              {isSeries ? "Featured Series" : "Featured Movie"}
            </span>
            {rating !== null && rating !== undefined && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-black/70 text-[#f5c518] border border-white/10 backdrop-blur-md">
                <Star className="w-3.5 h-3.5 fill-[#f5c518]" />
                <span>{formatRating(rating)} IMDb</span>
              </div>
            )}
            <span className="text-xs text-slate-300 font-medium px-1">
              {current.releaseYear} &bull; {isSeries ? "All Seasons" : formatDuration(current.runtime)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-[1.1] drop-shadow-2xl line-clamp-2 sm:line-clamp-3">
            {current.title}
          </h1>

          {/* Synopsis */}
          <p className="text-slate-300 text-xs sm:text-sm lg:text-base line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {current.overview || "Stream in 4K Ultra-HD with multiple high-speed servers and direct download links on Movies.snishad."}
          </p>

          {/* Genres Strip */}
          {current.genres && current.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {current.genres.slice(0, 3).map((g, idx) => {
                const genreName = g?.genre?.name || (g as any)?.name;
                if (!genreName) return null;
                return (
                  <span
                    key={(g as any)?.genre?.id || (g as any)?.id || idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300"
                  >
                    {genreName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href={watchHref}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#e50914] hover:bg-[#f40612] text-white font-bold text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-105 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Now</span>
            </Link>

            {trailerEmbed && (
              <button
                onClick={() => setTrailerModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/15 transition-all hover:scale-105 cursor-pointer"
              >
                <span>Trailer</span>
              </button>
            )}

            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-black/50 hover:bg-black/70 text-slate-300 hover:text-white font-medium text-sm backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-8 bg-[#e50914]" : "w-2.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Trailer Modal */}
      {trailerModalOpen && trailerEmbed && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <button
              onClick={() => setTrailerModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/80 text-white hover:bg-[#e50914] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={trailerEmbed}
              title={`${current.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
