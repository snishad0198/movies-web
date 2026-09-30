"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DownloadCloud, Eye } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-neutral-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-[#e50914]" />
          <span>Advanced Telemetry & Analytics</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Detailed metrics on visitor views, top consumed media, and download traffic.
        </p>
      </div>

      <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-6">Audience Growth (7 Days)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.viewsChart || []}>
              <defs>
                <linearGradient id="anViewsGrad" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#anViewsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Top 10 Most Viewed Titles</span>
          </h3>
          <div className="space-y-3">
            {(data?.topViewed || []).map((m: any, i: number) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-xs font-bold text-neutral-500 w-4">#{i + 1}</span>
                  <span className="font-semibold text-white">{m.title}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {m.viewCount.toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f101c] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <DownloadCloud className="w-4 h-4 text-amber-400" />
            <span>Top 10 Most Downloaded Titles</span>
          </h3>
          <div className="space-y-3">
            {(data?.topDownloaded || []).map((m: any, i: number) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-xs font-bold text-neutral-500 w-4">#{i + 1}</span>
                  <span className="font-semibold text-white">{m.title}</span>
                </div>
                <span className="text-xs font-bold text-amber-400">
                  {m.downloadCount.toLocaleString()} downloads
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
