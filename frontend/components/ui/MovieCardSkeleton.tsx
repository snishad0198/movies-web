"use client";

import React from "react";

export function MovieCardSkeleton() {
  return (
    <div className="relative flex-shrink-0 select-none rounded-xl overflow-hidden bg-[#14141c] border border-white/5 shadow-md">
      {/* Shimmering Poster Box */}
      <div className="relative aspect-[2/3] w-full skeleton-shimmer flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-white/5" />
      </div>

      {/* Shimmering Title and Metadata strip */}
      <div className="p-3 bg-[#121218] space-y-2">
        <div className="h-3.5 bg-white/10 rounded w-4/5 skeleton-shimmer" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-2.5 bg-white/10 rounded w-1/4 skeleton-shimmer" />
          <div className="h-2.5 bg-white/10 rounded w-1/4 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default MovieCardSkeleton;
