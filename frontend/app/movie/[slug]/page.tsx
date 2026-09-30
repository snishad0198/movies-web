import React from "react";
import Link from "next/link";
import { LazyImage } from "@/components/ui/LazyImage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieBySlug } from "@/lib/api";
import { formatRating, formatDuration, getImageUrl } from "@/lib/utils";
import { DownloadCenter } from "@/components/download/DownloadCenter";
import { CommentSection } from "@/components/comments/CommentSection";
import { Star, Clock, Calendar, Globe, Share2, Play, Download } from "lucide-react";

interface MoviePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const movie = await getMovieBySlug(params.slug);
  if (!movie) {
    return { title: "Movie Not Found" };
  }

  const title = `Watch ${movie.title} (${movie.releaseYear || "2024"}) Full Movie Online & Download`;
  const description = movie.overview || `Stream and download ${movie.title} in HD/4K with high-speed direct download links on Movies.snishad.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: movie.posterPath ? [getImageUrl(movie.posterPath)] : [],
    },
  };
}

export default async function MovieDetailsPage({ params }: MoviePageProps) {
  const movie = await getMovieBySlug(params.slug);

  if (!movie) {
    notFound();
  }

  const posterUrl = getImageUrl(movie.posterPath);
  const backdropUrl = getImageUrl(movie.backdropPath || movie.posterPath);
  const cleanTmdbId = String(movie.tmdbId || movie.id || "").trim();

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    image: posterUrl,
    description: movie.overview,
    dateCreated: movie.releaseYear ? `${movie.releaseYear}-01-01` : undefined,
    aggregateRating: movie.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: movie.rating,
          bestRating: "10",
          ratingCount: movie.views || 100,
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-[#08080c] pb-20 pt-20">
      {/* Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Backdrop Header Ambient */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] -mt-20 overflow-hidden">
        <LazyImage
          src={backdropUrl}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-30 blur-sm scale-105"
          fallbackText={movie.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-52 relative z-20">
        {/* Main Details Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          {/* Poster Card */}
          <div className="w-48 sm:w-60 md:w-72 flex-shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative aspect-[2/3] bg-[#121218]">
            <LazyImage
              src={posterUrl}
              alt={movie.title}
              fill
              priority
              sizes="(max-width: 768px) 240px, 288px"
              className="object-cover"
              fallbackText={movie.title}
            />
          </div>

          {/* Title & Metadata Info */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {movie.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5c518]/10 text-[#f5c518] border border-[#f5c518]/20 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#f5c518]" />
                  <span>{formatRating(movie.rating)} / 10 IMDb</span>
                </div>
              )}
              {movie.quality && (
                <span className="px-2.5 py-1 rounded-full bg-[#e50914]/10 text-[#e50914] border border-[#e50914]/20 text-xs font-bold uppercase tracking-wider">
                  {movie.quality}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-wide uppercase leading-tight">
              {movie.title}
            </h1>

            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              {movie.releaseYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{movie.releaseYear}</span>
                </div>
              )}
              {movie.runtime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDuration(movie.runtime)}</span>
                </div>
              )}
              {movie.language && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="uppercase">{movie.language} (Dual Audio)</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                {movie.genres.map((g, idx) => {
                  const genre = (g as any)?.genre || g;
                  if (!genre?.name) return null;
                  return (
                    <Link
                      key={genre.id || idx}
                      href={`/genre/${genre.slug || genre.name.toLowerCase()}`}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    >
                      {genre.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Synopsis */}
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Storyline
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {movie.overview || "No synopsis available for this title."}
              </p>
            </div>

            {/* PRIMARY ACTION CTA BUTTONS */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              <Link
                href={`/watch/${movie.slug}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#e50914] hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/40 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Now in HD</span>
              </Link>
              <a
                href={`https://02moviedownloader.top/api/download/movie/${cleanTmdbId || movie.imdbId || movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/10 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Full Movie</span>
              </a>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div id="downloads">
          <DownloadCenter
            title={movie.title}
            tmdbId={movie.tmdbId}
            imdbId={movie.imdbId}
            movieId={movie.id}
            type="MOVIE"
          />
        </div>

        {/* Audience Comments & Reviews Section */}
        <div id="reviews">
          <CommentSection movieId={movie.id} movieTitle={movie.title} />
        </div>
      </div>
    </div>
  );
}
