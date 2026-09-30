"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);

      const res = await fetch(`/api/admin/movies?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMovies(data.data);
        setTotal(data.pagination.total);
      }
    } catch (e) {
      console.error("Fetch movies error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/movies?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMovies(movies.filter((m) => m.id !== id));
        setTotal((prev) => prev - 1);
      } else {
        alert(data.error || "Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Film className="w-7 h-7 text-[#e50914]" />
            <span>Movies Management</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Total {total} movies in catalog. Manage streaming servers and fallback download links.
          </p>
        </div>

        <Link
          href="/admin/movies/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-semibold text-sm transition-all shadow-lg shadow-[#e50914]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Movie</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f101c] border border-white/10 p-4 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, TMDB ID, or director..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#e50914]"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#e50914] w-full sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="HIDDEN">Hidden</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#0f101c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-neutral-400 border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Poster & Title</th>
                <th className="py-3.5 px-4">Year & Lang</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Views / DL</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    Loading movies catalog...
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No movies found. Click "+ Add New Movie" to add one.
                  </td>
                </tr>
              ) : (
                movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster || "/placeholder-poster.jpg"}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg bg-neutral-900 border border-white/10 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{movie.title}</div>
                          <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                            <span>TMDB: {movie.tmdbId || "N/A"}</span>
                            {movie.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{movie.releaseYear || "—"}</div>
                      <div className="text-xs text-neutral-400">{movie.language || "Hindi"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{movie.imdbRating ? movie.imdbRating.toFixed(1) : "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          movie.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/30"
                        }`}
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        {movie.viewCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {movie.downloadCount.toLocaleString()} downloads
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`http://localhost:3001/movie/${movie.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <span>
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={page * 15 >= total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
