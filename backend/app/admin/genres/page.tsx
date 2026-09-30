"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Trash2, Check } from "lucide-react";

export default function AdminGenresPage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e50914");
  const [sortOrder, setSortOrder] = useState("0");
  const [loading, setLoading] = useState(false);

  const fetchGenres = async () => {
    try {
      const res = await fetch("/api/admin/genres");
      const json = await res.json();
      if (json.success) setGenres(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color,
          sortOrder: parseInt(sortOrder, 10) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setName("");
        fetchGenres();
      } else {
        alert(data.error || "Failed to add genre");
      }
    } catch {
      alert("Failed to add genre");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;
    try {
      await fetch(`/api/admin/genres?id=${id}`, { method: "DELETE" });
      setGenres(genres.filter((g) => g.id !== id));
    } catch {
      alert("Failed to delete genre");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Layers className="w-7 h-7 text-[#e50914]" />
          <span>Genre Management</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Create and organize content categories and genre tags for Movies.snishad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Genre Form */}
        <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 h-fit">
          <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#e50914]" />
            <span>Add New Genre</span>
          </h2>

          <form onSubmit={handleAddGenre} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Genre Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Fiction"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-[#e50914]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-bold text-sm transition-all shadow-lg shadow-[#e50914]/20 cursor-pointer"
            >
              {loading ? "Adding..." : "+ Create Genre"}
            </button>
          </form>
        </div>

        {/* Existing Genres List */}
        <div className="md:col-span-2 bg-[#0f101c] border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">
            Existing Genres ({genres.length})
          </h2>

          <div className="divide-y divide-white/5">
            {genres.map((g) => (
              <div
                key={g.id}
                className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: g.color || "#e50914" }}
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{g.name}</div>
                    <div className="text-xs text-neutral-500">
                      slug: <code className="text-neutral-400">{g.slug}</code> • {g._count?.movies || 0} titles
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete genre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
