import React from "react";
import { getNewReleases } from "@/lib/api";
import { MovieCard } from "@/components/movies/MovieCard";
import { Sparkles } from "lucide-react";

export const revalidate = 60;

export default async function NewReleasesPage() {
  const items = await getNewReleases();

  return (
    <div className="min-h-screen bg-[#08080c] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h1 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-wide">
            New Releases
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Freshly added movies, series, and episodes available in Ultra HD.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {items.map((item) => (
            <MovieCard key={item.id} movie={item} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          <p className="text-base font-semibold text-white mb-1">Checking new releases</p>
          <p className="text-xs">Stay tuned as new titles are uploaded daily.</p>
        </div>
      )}
    </div>
  );
}
