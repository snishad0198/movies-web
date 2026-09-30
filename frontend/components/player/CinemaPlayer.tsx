"use client";

import React, { useState } from "react";
import { Server, Moon, Sun, RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";
import { StreamSource } from "@/lib/types";

interface CinemaPlayerProps {
  sources?: StreamSource[];
  defaultTitle: string;
  tmdbId?: number | string | null;
  imdbId?: string | null;
  type?: "MOVIE" | "SERIES";
  season?: number;
  episode?: number;
  poster?: string;
  slug?: string;
}

export function CinemaPlayer({
  sources = [],
  defaultTitle,
  tmdbId,
  imdbId,
  type = "MOVIE",
  season = 1,
  episode = 1,
  poster,
  slug,
}: CinemaPlayerProps) {
  const cleanTmdbId = tmdbId ? String(tmdbId).trim() : "";

  // Built-in high-speed verified embed servers fallback
  const defaultEmbeds: StreamSource[] = [];
  if (cleanTmdbId) {
    if (type === "MOVIE") {
      defaultEmbeds.push(
        { id: 101, serverName: "VIP MultiEmbed (Auto)", url: `https://multiembed.mov/?video_id=${cleanTmdbId}&tmdb=1`, priority: 1, isEmbed: true },
        { id: 102, serverName: "VIP VidSrc (Dual Audio)", url: `https://vidsrc.me/embed/movie?tmdb=${cleanTmdbId}`, priority: 2, isEmbed: true },
        { id: 103, serverName: "VIP Embed.su (HDR)", url: `https://embed.su/embed/movie/${cleanTmdbId}`, priority: 3, isEmbed: true },
        { id: 104, serverName: "AutoEmbed Fast", url: `https://autoembed.co/movie/tmdb/${cleanTmdbId}`, priority: 4, isEmbed: true },
        { id: 105, serverName: "VidLink HD", url: `https://vidlink.pro/movie/${cleanTmdbId}`, priority: 5, isEmbed: true }
      );
    } else {
      defaultEmbeds.push(
        { id: 201, serverName: "VIP MultiEmbed (Auto)", url: `https://multiembed.mov/?video_id=${cleanTmdbId}&tmdb=1&s=${season}&e=${episode}`, priority: 1, isEmbed: true },
        { id: 202, serverName: "VIP VidSrc (Dual Audio)", url: `https://vidsrc.me/embed/tv?tmdb=${cleanTmdbId}&sea=${season}&epi=${episode}`, priority: 2, isEmbed: true },
        { id: 203, serverName: "VIP Embed.su (HDR)", url: `https://embed.su/embed/tv/${cleanTmdbId}/${season}/${episode}`, priority: 3, isEmbed: true },
        { id: 204, serverName: "AutoEmbed Fast", url: `https://autoembed.co/tv/tmdb/${cleanTmdbId}-${season}-${episode}`, priority: 4, isEmbed: true },
        { id: 205, serverName: "VidLink HD", url: `https://vidlink.pro/tv/${cleanTmdbId}/${season}/${episode}`, priority: 5, isEmbed: true }
      );
    }
  }

  // Combine database sources with automatic VIP servers
  const validDbSources = sources.filter(
    (s) => s.url && !s.url.includes("example.com") && !s.url.includes("vidcore.net") && !s.url.includes("embedflix.in")
  );

  const combinedSources = [...validDbSources];
  defaultEmbeds.forEach((de) => {
    if (!combinedSources.some((cs) => cs.url === de.url)) {
      combinedSources.push(de);
    }
  });

  const allSources = combinedSources.length > 0 ? combinedSources : defaultEmbeds;
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const activeSource = allSources[activeSourceIndex] || allSources[0];

  React.useEffect(() => {
    try {
      if (!defaultTitle) return;
      const historyStr = localStorage.getItem("watch_history") || "[]";
      const history = JSON.parse(historyStr);
      const filtered = Array.isArray(history) ? history.filter((x: any) => x.title !== defaultTitle) : [];
      filtered.unshift({
        id: cleanTmdbId || defaultTitle,
        title: defaultTitle,
        slug: slug || "",
        poster: poster || "",
        posterPath: poster || "",
        type: type === "SERIES" ? "SERIES" : "MOVIE",
        season,
        episode,
        timestamp: Date.now(),
      });
      localStorage.setItem("watch_history", JSON.stringify(filtered.slice(0, 20)));
    } catch {
      // ignore
    }
  }, [defaultTitle, cleanTmdbId, type, season, episode, poster, slug]);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`relative transition-all duration-300 ${theaterMode ? "z-50 py-4" : "py-2"}`}>
      {/* Theater Mode Overlay */}
      {theaterMode && (
        <div
          onClick={() => setTheaterMode(false)}
          className="fixed inset-0 bg-black/95 z-40 backdrop-blur-md cursor-pointer transition-opacity duration-300"
        />
      )}

      <div className={`relative z-50 ${theaterMode ? "max-w-6xl mx-auto px-4" : "w-full"}`}>
        {/* Player Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-2.5 rounded-xl bg-[#121218] border border-white/5">
          {/* Server Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 px-2">
              <Server className="w-3.5 h-3.5 text-[#e50914]" />
              <span>Streams:</span>
            </div>
            {allSources.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => {
                  setActiveSourceIndex(idx);
                  setIframeKey((prev) => prev + 1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSourceIndex === idx
                    ? "bg-[#e50914] text-white shadow-lg shadow-red-600/30 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5"
                }`}
              >
                <span>{s.serverName}</span>
                {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleReload}
              className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 border border-white/5"
              title="Refresh Stream"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Reload</span>
            </button>

            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className={`p-1.5 px-2.5 rounded-lg transition-colors text-xs flex items-center gap-1.5 border ${
                theaterMode
                  ? "bg-[#e50914] text-white border-transparent"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5 font-medium"
              }`}
              title="Toggle Cinema Theater Mode"
            >
              {theaterMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{theaterMode ? "Exit Theater" : "Theater Mode"}</span>
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          {activeSource ? (
            <iframe
              key={`${iframeKey}-${activeSource.url}`}
              src={activeSource.url}
              title={`${defaultTitle} Player`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
              allowFullScreen={true}
              // @ts-ignore
              webkitallowfullscreen="true"
              // @ts-ignore
              mozallowfullscreen="true"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
              <h3 className="text-white font-semibold text-sm mb-1">Stream Server Loading</h3>
              <p className="text-xs max-w-sm">
                No active stream source configured. Please select another server or download the file directly below.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ad-free cinema mode enabled. If playback buffers, switch between VIP servers above.</span>
          </span>
          <span className="hidden sm:inline text-slate-500">Dual Audio &bull; 1080p / 4K</span>
        </div>
      </div>
    </div>
  );
}
