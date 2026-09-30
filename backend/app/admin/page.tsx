"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Film,
  Tv,
  Eye,
  DownloadCloud,
  MessageSquare,
  Plus,
  TrendingUp,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalMovies: 0,
    totalSeries: 0,
    viewsToday: 0,
    totalDownloads: 0,
    totalComments: 0,
  };

  const statCards = [
    { label: "Total Movies", value: stats.totalMovies, icon: Film, color: "text-[#e50914]" },
    { label: "Total Series", value: stats.totalSeries, icon: Tv, color: "text-blue-500" },
    { label: "Views Today", value: stats.viewsToday, icon: Eye, color: "text-emerald-500" },
    { label: "Downloads Clicked", value: stats.totalDownloads, icon: DownloadCloud, color: "text-amber-500" },
    { label: "User Comments", value: stats.totalComments, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Platform Analytics & Overview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time traffic, engagement metrics, and streaming telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/movies/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#ff1f2d] text-white font-semibold text-sm transition-all shadow-lg shadow-[#e50914]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movie</span>
          </Link>
          <Link
            href="/admin/series"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Series</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-[#0f101c] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-3xl font-black text-white mt-3">
                {card.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Day Views Area Chart */}
      <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-[#e50914]" />
            <h2 className="text-base font-bold text-white">Views Trend (Last 7 Days)</h2>
          </div>
          <span className="text-xs text-neutral-400">Aggregated View Count</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.viewsChart || []}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e50914" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090a12",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#e50914"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#viewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row: Top Titles & Popular Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed */}
        <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>Most Viewed Content</span>
            <Link href="/admin/movies" className="text-xs text-[#e50914] hover:underline">
              View All
            </Link>
          </h3>
          <div className="space-y-3">
            {(data?.topViewed || []).slice(0, 5).map((m: any, idx: number) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-neutral-500 w-5">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white line-clamp-1">
                      {m.title}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {m.releaseYear} • {m.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    {m.viewCount.toLocaleString()} views
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {m.downloadCount.toLocaleString()} dl
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Search Queries */}
        <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>Recent Search Inquiries</span>
            <Search className="w-4 h-4 text-neutral-500" />
          </h3>
          <div className="space-y-2.5">
            {(data?.recentSearches || []).length === 0 ? (
              <div className="text-sm text-neutral-500 py-8 text-center">
                No recent searches logged yet.
              </div>
            ) : (
              (data?.recentSearches || []).map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-sm"
                >
                  <span className="text-neutral-300 font-medium">{s.value}</span>
                  <span className="text-xs text-neutral-500">
                    {new Date(s.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
