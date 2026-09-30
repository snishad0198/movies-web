"use client";

import React from "react";
import { Download, ShieldCheck, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";

interface DownloadCenterProps {
  title: string;
  tmdbId?: string | number | null;
  imdbId?: string | null;
  movieId?: number;
  type?: "MOVIE" | "SERIES";
  season?: number;
  episode?: number;
  year?: number | null;
  fallbackLinks?: any[];
}

export function DownloadCenter({
  title,
  tmdbId,
  imdbId,
  movieId,
  type = "MOVIE",
  season = 1,
  episode = 1,
}: DownloadCenterProps) {
  const isSeries = type === "SERIES";
  const idParam = String(tmdbId || imdbId || movieId || "").trim();

  const downloadUrl = isSeries
    ? `https://02moviedownloader.top/api/download/tv/${idParam}/${season}/${episode}`
    : `https://02moviedownloader.top/api/download/movie/${idParam}`;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#10101c] via-[#141426] to-[#10101c] border border-white/10 shadow-2xl my-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official High-Speed Cloud Downloader</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">
            Download {isSeries ? `Season ${season} Episode ${episode}` : title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Direct high-speed downloads powered exclusively by 2moviedownloader.top. Supports 1080p Full HD, 720p HD, 480p mobile, and subtitles. Compatible with IDM, 1DM, and ADM.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cloud Verified &bull; No Speed Limit</span>
        </div>
      </div>

      {/* SINGLE UNIFIED DOWNLOAD BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 p-5 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase">
              All Qualities Included
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              1080p FHD &bull; 720p HD &bull; 480p SD
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Click the download button below to verify and select your desired video resolution and dual-audio tracks.
          </p>
        </div>

        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-[#e50914] to-red-600 hover:opacity-95 text-white text-sm font-black uppercase tracking-wider shadow-xl shadow-red-950/50 hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Download in HD / 4K</span>
          <ExternalLink className="w-4 h-4 opacity-80" />
        </a>
      </div>
    </div>
  );
}
