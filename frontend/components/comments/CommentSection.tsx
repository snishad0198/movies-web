"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Send, User } from "lucide-react";

interface Comment {
  id: number;
  authorName: string;
  content: string;
  rating?: number | null;
  createdAt: string;
}

interface CommentSectionProps {
  movieId: number;
  movieTitle: string;
}

export function CommentSection({ movieId, movieTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const apiUrl = typeof window !== "undefined" ? "/api/proxy/comments" : "http://localhost:3000/api/comments";

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`${apiUrl}?movieId=${movieId}`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY || "movies-snishad-secure-internal-token-2026",
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setComments(data.data);
        }
      } catch (e) {
        // silent catch
      }
    }
    loadComments();
  }, [apiUrl, movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY || "movies-snishad-secure-internal-token-2026",
        },
        body: JSON.stringify({
          movieId,
          authorName: authorName.trim(),
          content: content.trim(),
          rating,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage("Review submitted successfully! Thank you.");
        setAuthorName("");
        setContent("");
        // Append optimistic review
        setComments((prev) => [
          {
            id: Date.now(),
            authorName: authorName.trim(),
            content: content.trim(),
            rating,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        setMessage(json.error || "Failed to submit comment.");
      }
    } catch (e) {
      setMessage("Error submitting review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#121218] border border-white/10 my-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#e50914]" />
        <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
          Audience Reviews &amp; Discussion
        </h3>
        <span className="text-xs text-slate-400">({comments.length})</span>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your Name (e.g. Rahul S.)"
              required
              className="w-full bg-[#161622] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 mr-2">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="p-1 text-[#f5c518] hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-4 h-4 ${
                    star <= rating ? "fill-[#f5c518]" : "text-slate-600 stroke-1"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Write your honest review or opinion on ${movieTitle}...`}
            rows={3}
            required
            className="w-full bg-[#161622] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e50914] resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          {message && <p className="text-xs text-emerald-400">{message}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e50914] hover:bg-red-600 text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "Posting..." : "Post Review"}</span>
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No reviews yet. Be the first to share your thoughts on {movieTitle}!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#e50914]/20 text-[#e50914] flex items-center justify-center font-bold text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">{c.authorName}</span>
                </div>
                {c.rating && (
                  <div className="flex items-center gap-1 text-[#f5c518] text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#f5c518]" />
                    <span>{c.rating}/5</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-9">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
