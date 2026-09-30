"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home, Instagram } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            An unexpected error occurred while loading this page. You can try reloading or return to the home screen.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-medium text-xs shadow-lg shadow-rose-950/40 transition-all hover:scale-105"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-medium text-xs transition-all hover:scale-105"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500">
          <p>
            Encountering bugs? Report them to{" "}
            <a
              href="https://instagram.com/snishad.me_"
              target="_blank"
              rel="noreferrer"
              className="text-pink-400 hover:underline font-medium"
            >
              @snishad.me_ on Instagram
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
