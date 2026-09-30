"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LazyImage } from "@/components/ui/LazyImage";
import { Star, Clock, Calendar, Globe, Play, Download, Layers, Tv } from "lucide-react";
import { MovieItem, SeriesSeason, SeriesEpisode } from "@/lib/types";
import { formatRating, formatDuration, getImageUrl } from "@/lib/utils";
import { DownloadCenter } from "@/components/download/DownloadCenter";
import { CommentSection } from "@/components/comments/CommentSection";
import { getSeriesBySlug } from "@/lib/api";

interface SeriesPageProps {
  params: {
    slug: string;
  };
}

export default function SeriesDetailsPage({ params }: SeriesPageProps) {
  const [series, setSeries] = useState<MovieItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSeasonNum, setActiveSeasonNum] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<SeriesEpisode | null>(null);

  useEffect(() => {
    async function loadSeries() {
      try {
        const data = await getSeriesBySlug(params.slug);
        if (data) {
          setSeries(data);
          if (data.seasons && data.seasons.length > 0) {
            const firstSeason = data.seasons[0];
            const sNum = firstSeason.seasonNumber ?? firstSeason.seasonNum ?? 1;
            setActiveSeasonNum(sNum);
            if (firstSeason.episodes && firstSeason.episodes.length > 0) {
              setActiveEpisode(firstSeason.episodes[0]);
            }
          }
        }
      } catch (e) {
        // silent catch
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-[#08080c] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Web Series Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The requested series could not be found in our database.</p>
        <Link href="/series" className="px-4 py-2 rounded-lg bg-[#e50914] text-white text-xs font-semibold">
          Browse All Series
        </Link>
      </div>
    );
  }

  const posterUrl = getImageUrl(series.posterPath || series.poster);
  const backdropUrl = getImageUrl(series.backdropPath || series.backdrop || series.posterPath || series.poster);
  const currentSeason = series.seasons?.find((s) => (s.seasonNumber ?? s.seasonNum) === activeSeasonNum) || series.seasons?.[0];
  const episodeNumber = activeEpisode?.episodeNumber ?? activeEpisode?.episodeNum ?? 1;
  const cleanTmdbId = String(series.tmdbId || series.id || "").trim();

  return (
    <div className="min-h-screen bg-[#08080c] pb-20 pt-20">
      {/* Backdrop Ambient */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] -mt-20 overflow-hidden">
        <LazyImage
          src={backdropUrl}
          alt={series.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30 blur-sm scale-105"
          fallbackText={series.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-52 relative z-20">
        {/* Main Details Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Poster */}
          <div className="w-48 sm:w-60 md:w-72 flex-shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative aspect-[2/3] bg-[#121218]">
            <LazyImage
              src={posterUrl}
              alt={series.title}
              fill
              priority
              sizes="(max-width: 768px) 240px, 288px"
              className="object-cover"
              fallbackText={series.title}
            />
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-lg">
              Web Series
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {(series.rating || series.imdbRating) && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5c518]/10 text-[#f5c518] border border-[#f5c518]/20 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#f5c518]" />
                  <span>{formatRating(series.rating ?? series.imdbRating)} / 10 IMDb</span>
                </div>
              )}
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                {series.seasons?.length || 1} Season{(series.seasons?.length || 1) > 1 ? "s" : ""} Available
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-wide uppercase leading-tight">
              {series.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              {series.releaseYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{series.releaseYear}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-slate-400" />
                <span>All Episodes Dual Audio (Hindi / English)</span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Series Synopsis
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {series.description || series.overview || "Stream and download all episodes of this web series in 1080p and 4K."}
              </p>
            </div>

            {/* PRIMARY ACTION CTA BUTTONS */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              <Link
                href={`/watch/${series.slug}?season=${activeSeasonNum}&episode=${episodeNumber}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#e50914] hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch S{activeSeasonNum}:E{episodeNumber} in HD</span>
              </Link>
              <a
                href={`https://02moviedownloader.top/api/download/tv/${cleanTmdbId || series.imdbId || series.id}/${activeSeasonNum}/${episodeNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/10 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Episode</span>
              </a>
            </div>
          </div>
        </div>

        {/* Season & Episode Selector Hub */}
        <div className="p-6 rounded-2xl bg-[#121218] border border-white/10 my-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-[#e50914]" />
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
              Seasons &amp; Episodes
            </h3>
          </div>

          {/* Season Tabs */}
          {series.seasons && series.seasons.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-white/5 mb-6">
              {series.seasons.map((s) => {
                const sNum = s.seasonNumber ?? s.seasonNum ?? 1;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSeasonNum(sNum);
                      if (s.episodes && s.episodes.length > 0) {
                        setActiveEpisode(s.episodes[0]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                      activeSeasonNum === sNum
                        ? "bg-[#e50914] text-white shadow-lg shadow-red-600/30"
                        : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Season {sNum}
                  </button>
                );
              })}
            </div>
          )}

          {/* Episodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSeason?.episodes && currentSeason.episodes.length > 0 ? (
              currentSeason.episodes.map((ep) => {
                const epNum = ep.episodeNumber ?? ep.episodeNum ?? 1;
                const isCurrent = activeEpisode?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                      isCurrent
                        ? "bg-[#e50914]/10 border-[#e50914]/50"
                        : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase text-[#e50914]">
                          Episode {epNum}
                        </span>
                        {ep.duration && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {ep.duration}m
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#e50914] transition-colors truncate">
                        {ep.title || `Episode ${epNum}`}
                      </h4>
                      {(ep.description || ep.overview) && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {ep.description || ep.overview}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Link
                        href={`/watch/${series.slug}?season=${activeSeasonNum}&episode=${epNum}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-[#e50914] text-white transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Watch Online</span>
                      </Link>
                      <a
                        href={`https://02moviedownloader.top/api/download/tv/${cleanTmdbId || series.imdbId || series.id}/${activeSeasonNum}/${epNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Download Episode"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 col-span-full py-4 text-center">
                Episodes for Season {activeSeasonNum} are being synced.
              </p>
            )}
          </div>
        </div>

        {/* Episode Download Center */}
        <div id="downloads">
          <DownloadCenter
            title={series.title}
            tmdbId={series.tmdbId}
            imdbId={series.imdbId}
            movieId={series.id}
            type="SERIES"
            season={activeSeasonNum}
            episode={episodeNumber}
          />
        </div>

        {/* Comments Section */}
        <CommentSection movieId={series.id} movieTitle={series.title} />
      </div>
    </div>
  );
}
