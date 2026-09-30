"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Upload,
  Link2,
  Server,
  DownloadCloud,
} from "lucide-react";

export default function AddMoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [genresList, setGenresList] = useState<any[]>([]);

  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [imdbId, setImdbId] = useState("");
  const [imdbRating, setImdbRating] = useState("7.5");
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear().toString());
  const [runtime, setRuntime] = useState("120");
  const [language, setLanguage] = useState("Hindi");
  const [country, setCountry] = useState("India");
  const [director, setDirector] = useState("");
  const [production, setProduction] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState("");
  const [backdrop, setBackdrop] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("PUBLISHED");
  const [tags, setTags] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);

  // Repeaters
  const [streamSources, setStreamSources] = useState<any[]>([
    { serverName: "VIP Ultra Server 1", url: "", type: "EMBED", quality: "1080p", language: "Hindi" },
    { serverName: "VidCore Premium HD", url: "", type: "EMBED", quality: "1080p", language: "Hindi" },
  ]);

  const [downloadLinks, setDownloadLinks] = useState<any[]>([
    { quality: "1080p", sizeLabel: "2.4 GB", url: "", provider: "Fast Cloud" },
    { quality: "720p", sizeLabel: "1.2 GB", url: "", provider: "Fast Cloud" },
    { quality: "480p", sizeLabel: "500 MB", url: "", provider: "Fast Cloud" },
  ]);

  // Fetch available genres for checkboxes
  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setGenresList(j.data);
      })
      .catch(() => {});
  }, []);

  // TMDB Auto-fill button action
  const handleTmdbAutoFill = async () => {
    if (!tmdbId) {
      alert("Please enter a TMDB ID first (e.g. 857598 or 872585)");
      return;
    }

    setTmdbLoading(true);
    try {
      const res = await fetch("/api/admin/tmdb-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, type: "movie" }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        const d = data.data;
        setTitle(d.title || "");
        setDescription(d.overview || "");
        setPoster(d.poster || "");
        setBackdrop(d.backdrop || "");
        if (d.releaseYear) setReleaseYear(String(d.releaseYear));
        if (d.runtime) setRuntime(String(d.runtime));
        if (d.director) setDirector(d.director);
        if (d.imdbId) setImdbId(d.imdbId);
        if (d.trailerUrl) setTrailerUrl(d.trailerUrl);
        if (d.language) setLanguage(d.language);

        // Pre-fill stream sources with default embed format
        setStreamSources([
          { serverName: "VidCore Premium HD", url: `https://vidcore.net/movie/${tmdbId}`, type: "EMBED", quality: "1080p", language: d.language || "Hindi" },
          { serverName: "VidSrc Fast", url: `https://vidsrc.pro/embed/movie/${tmdbId}`, type: "EMBED", quality: "1080p", language: d.language || "Hindi" },
          { serverName: "EmbedFlix Mirror", url: `https://embedflix.in/embed/movie/${tmdbId}`, type: "EMBED", quality: "720p", language: d.language || "Hindi" },
        ]);

        // Match genres by name
        if (Array.isArray(d.genres) && genresList.length > 0) {
          const matchedIds = genresList
            .filter((g) => d.genres.some((dg: string) => dg.toLowerCase() === g.name.toLowerCase()))
            .map((g) => g.id);
          setSelectedGenreIds(matchedIds);
        }

        alert(`Successfully auto-filled "${d.title}" from TMDB!`);
      } else {
        alert(data.error || "Could not find title on TMDB");
      }
    } catch {
      alert("Failed to contact TMDB API.");
    } finally {
      setTmdbLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        slug: slug || undefined,
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: parseInt(releaseYear, 10),
        runtime: runtime ? parseInt(runtime, 10) : undefined,
        language,
        country,
        director,
        production,
        imdbId,
        tmdbId,
        imdbRating: parseFloat(imdbRating) || 7.0,
        featured,
        status,
        tags,
        genreIds: selectedGenreIds,
        streamSources: streamSources.filter((s) => Boolean(s.url)),
        downloadLinks: downloadLinks.filter((d) => Boolean(d.url)),
      };

      const res = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Movie saved and published successfully!");
        router.push("/admin/movies");
      } else {
        alert(data.error || "Save failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/movies"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Add New Movie</h1>
            <p className="text-xs text-neutral-400">Fill details manually or use TMDB Auto-Fill</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-sm shadow-lg shadow-[#e50914]/25 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving..." : "Save & Publish"}</span>
        </button>
      </div>

      {/* TMDB Quick-Fill Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#e50914]/15 via-purple-500/10 to-transparent border border-[#e50914]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e50914] flex items-center justify-center text-white shadow-lg shadow-[#e50914]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">TMDB Instant Auto-Fill</div>
            <div className="text-xs text-neutral-400">
              Fetch title, poster, backdrop, synopsis, cast, and genres in one click
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="TMDB ID (e.g. 857598)"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-[#e50914] w-full sm:w-48"
          />
          <button
            type="button"
            onClick={handleTmdbAutoFill}
            disabled={tmdbLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs flex-shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tmdbLoading ? "Fetching..." : "Auto-Fill"}</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">General Info</h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Movie Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fighter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Overview / Synopsis</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full plot synopsis..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#e50914]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Release Year</label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Runtime (Mins)</label>
                <input
                  type="number"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">IMDb Rating</label>
                <input
                  type="number"
                  step="0.1"
                  value={imdbRating}
                  onChange={(e) => setImdbRating(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Director</label>
                <input
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Trailer YouTube URL</label>
                <input
                  type="text"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Streaming Sources Repeater */}
          <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-[#e50914]" />
                <span>Multi-Server Streaming Sources</span>
              </h2>
              <button
                type="button"
                onClick={() =>
                  setStreamSources([
                    ...streamSources,
                    { serverName: `Server ${streamSources.length + 1}`, url: "", type: "EMBED", quality: "1080p", language: "Hindi" },
                  ])
                }
                className="text-xs font-bold text-[#e50914] hover:underline"
              >
                + Add Another Server
              </button>
            </div>

            <div className="space-y-3">
              {streamSources.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400">Server #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setStreamSources(streamSources.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Server Name (e.g. VIP Server 1)"
                      value={s.serverName}
                      onChange={(e) => {
                        const next = [...streamSources];
                        next[idx].serverName = e.target.value;
                        setStreamSources(next);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Stream URL / Embed URL"
                      value={s.url}
                      onChange={(e) => {
                        const next = [...streamSources];
                        next[idx].url = e.target.value;
                        setStreamSources(next);
                      }}
                      className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fallback Download Links Repeater */}
          <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <DownloadCloud className="w-4 h-4 text-blue-500" />
                <span>Manual Fallback Download Links (Optional)</span>
              </h2>
              <button
                type="button"
                onClick={() =>
                  setDownloadLinks([
                    ...downloadLinks,
                    { quality: "720p", sizeLabel: "1.0 GB", url: "", provider: "Direct Link" },
                  ])
                }
                className="text-xs font-bold text-blue-400 hover:underline"
              >
                + Add Download Link
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Note: 02moviedownloader.top API is queried automatically first. These links are shown as secondary fallback if API returns empty.
            </p>

            <div className="space-y-3">
              {downloadLinks.map((d, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400">Quality Link #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setDownloadLinks(downloadLinks.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Quality (1080p, 720p...)"
                      value={d.quality}
                      onChange={(e) => {
                        const next = [...downloadLinks];
                        next[idx].quality = e.target.value;
                        setDownloadLinks(next);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Size (e.g. 2.4 GB)"
                      value={d.sizeLabel}
                      onChange={(e) => {
                        const next = [...downloadLinks];
                        next[idx].sizeLabel = e.target.value;
                        setDownloadLinks(next);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Download URL"
                      value={d.url}
                      onChange={(e) => {
                        const next = [...downloadLinks];
                        next[idx].url = e.target.value;
                        setDownloadLinks(next);
                      }}
                      className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Poster, Status, Genres */}
        <div className="space-y-6">
          <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Publish Status</h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Visibility</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="HIDDEN">Hidden</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#e50914] rounded"
              />
              <label htmlFor="featured" className="text-xs text-neutral-300 font-semibold cursor-pointer">
                Feature in Homepage Hero Slider
              </label>
            </div>
          </div>

          <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Media Images</h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Poster URL</label>
              <input
                type="text"
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
                placeholder="https://image.tmdb.org/t/p/w500/..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
              />
              {poster && (
                <img
                  src={poster}
                  alt="Poster preview"
                  className="w-24 h-36 object-cover rounded-xl mt-2 border border-white/10"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Backdrop / Hero URL</label>
              <input
                type="text"
                value={backdrop}
                onChange={(e) => setBackdrop(e.target.value)}
                placeholder="https://image.tmdb.org/t/p/original/..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
              />
              {backdrop && (
                <img
                  src={backdrop}
                  alt="Backdrop preview"
                  className="w-full h-24 object-cover rounded-xl mt-2 border border-white/10"
                />
              )}
            </div>
          </div>

          <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Genres</h2>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {genresList.map((g) => {
                const checked = selectedGenreIds.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      checked
                        ? "bg-[#e50914]/20 border-[#e50914] text-white"
                        : "bg-white/[0.02] border-white/10 text-neutral-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGenreIds([...selectedGenreIds, g.id]);
                        } else {
                          setSelectedGenreIds(selectedGenreIds.filter((id) => id !== g.id));
                        }
                      }}
                      className="hidden"
                    />
                    <span>{g.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
