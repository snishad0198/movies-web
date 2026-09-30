"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Tv,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Layers,
  Star,
  Eye,
} from "lucide-react";

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/series?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSeries(data.data);
        setTotal(data.pagination.total);
      }
    } catch (e) {
      console.error("Fetch series error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [page]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/movies?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSeries(series.filter((s) => s.id !== id));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Tv className="w-7 h-7 text-[#e50914]" />
            <span>Web Series Management</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Total {total} TV series and shows with seasons and episodes hierarchy.
          </p>
        </div>
      </div>

      <div className="bg-[#0f101c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-neutral-400 border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Poster & Title</th>
                <th className="py-3.5 px-4">Year & Lang</th>
                <th className="py-3.5 px-4">Seasons</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    Loading web series catalog...
                  </td>
                </tr>
              ) : series.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No web series found.
                  </td>
                </tr>
              ) : (
                series.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.poster || "/placeholder-poster.jpg"}
                          alt={s.title}
                          className="w-10 h-14 object-cover rounded-lg bg-neutral-900 border border-white/10 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white line-clamp-1">{s.title}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">
                            TMDB: {s.tmdbId || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{s.releaseYear || "—"}</div>
                      <div className="text-xs text-neutral-400">{s.language || "Hindi"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{s.seasons?.length || 1} Seasons</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{s.imdbRating ? s.imdbRating.toFixed(1) : "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        {s.viewCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`http://localhost:3001/series/${s.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(s.id, s.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete series"
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
      </div>
    </div>
  );
}
