import React from "react";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { MovieItem } from "@/lib/types";
import { formatRating, getImageUrl } from "@/lib/utils";
import { LazyImage } from "@/components/ui/LazyImage";
export { MovieCardSkeleton } from "@/components/ui/MovieCardSkeleton";

interface MovieCardProps {
  movie: MovieItem;
  rank?: number;
}

export function MovieCard({ movie, rank }: MovieCardProps) {
  const isSeries = movie.type === "SERIES";
  const href = isSeries ? `/series/${movie.slug}` : `/movie/${movie.slug}`;
  const posterUrl = getImageUrl(movie.posterPath || (movie as any).poster);
  const rating = movie.rating ?? (movie as any).imdbRating;

  return (
    <div className="group relative flex-shrink-0 select-none">
      <Link href={href} prefetch={false} className="block relative overflow-hidden rounded-xl bg-[#14141c] border border-white/5 shadow-md group-hover:border-red-600/40 group-hover:shadow-2xl group-hover:shadow-red-950/30 transition-all duration-300">
        {/* Poster Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <LazyImage
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fallbackText={movie.title}
          />

          {/* Vignette & Play Icon on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-200">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {/* Series Badge (Top Left) */}
          {isSeries && (
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600/80 backdrop-blur-md text-white">
                Series
              </span>
            </div>
          )}

          {/* Rating Badge (Top Right) */}
          {rating !== null && rating !== undefined && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/70 backdrop-blur-md text-[#f5c518] border border-white/10">
              <Star className="w-3.5 h-3.5 fill-[#f5c518]" />
              <span>{formatRating(rating)}</span>
            </div>
          )}

          {/* Optional Ranking Number (For Trending Top 10) */}
          {rank !== undefined && (
            <div className="absolute -bottom-4 -left-2 text-6xl sm:text-7xl font-display font-black text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] stroke-black pointer-events-none">
              {rank}
            </div>
          )}
        </div>

        {/* Title & Metadata Strip */}
        <div className="p-3 bg-[#121218]">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100 truncate group-hover:text-[#e50914] transition-colors" title={movie.title}>
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>{movie.releaseYear || "2024"}</span>
            <span className="uppercase">{movie.language || "Hindi"}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
