"use client";

import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, DownloadCloud, Activity } from "lucide-react";

export default function AdminReportsPage() {
  const [activeType, setActiveType] = useState("activity");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=${type}`);
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(activeType);
  }, [activeType]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-[#e50914]" />
          <span>Reports & Security Logs</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Inspect downloads clicks, visitor traffic logs, and system error events.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveType("activity")}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
            activeType === "activity" ? "bg-[#e50914] text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveType("downloads")}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
            activeType === "downloads" ? "bg-[#e50914] text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          Download Clicks
        </button>
        <button
          onClick={() => setActiveType("errors")}
          className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-colors ${
            activeType === "errors" ? "bg-[#e50914] text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          System Errors
        </button>
      </div>

      <div className="bg-[#0f101c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-white/[0.03] text-neutral-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Details / Value</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-500">
                    No log events recorded in this category.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 font-bold text-neutral-200">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-300 max-w-md truncate">
                      {log.value || log.message || log.referenceId || "—"}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{log.ip || "127.0.0.1"}</td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(log.createdAt).toLocaleString()}
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
