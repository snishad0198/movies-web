"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Check, Trash2, AlertTriangle } from "lucide-react";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      if (data.success) setComments(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/admin/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setComments(comments.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
      setComments(comments.filter((c) => c.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-[#e50914]" />
          <span>Comments Moderation</span>
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Review visitor feedback, approve, flag spam, or remove comments.
        </p>
      </div>

      <div className="bg-[#0f101c] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No comments submitted yet.</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-4 hover:bg-white/[0.02] flex items-start justify-between gap-4 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{c.name}</span>
                    <span className="text-xs text-neutral-400">• on "{c.movie?.title}"</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : c.status === "SPAM"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300">{c.content}</p>
                  <div className="text-xs text-neutral-500">
                    {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {c.status !== "APPROVED" && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, "APPROVED")}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {c.status !== "SPAM" && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, "SPAM")}
                      className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                      title="Mark Spam"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
