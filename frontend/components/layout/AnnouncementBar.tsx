"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Megaphone, X, ArrowRight } from "lucide-react";

interface AnnouncementBarProps {
  text?: string;
  link?: string;
  active?: boolean;
}

export function AnnouncementBar({ text, link, active }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!active || !text || dismissed) return null;

  return (
    <aside
      aria-label="Site announcement"
      className="relative z-50 bg-gradient-to-r from-[#e50914] via-rose-600 to-[#e50914] text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between"
      style={{
        background: "linear-gradient(90deg, var(--color-primary, #e50914), var(--color-accent, #ff1f2d), var(--color-primary, #e50914))",
      }}
    >
      <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
        <Megaphone className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
        <span className="truncate max-w-2xl">{text}</span>
        {link && (
          <Link
            href={link}
            className="inline-flex items-center gap-1 underline underline-offset-2 ml-1 text-white hover:text-amber-200 transition-colors"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-white/80 hover:text-white rounded hover:bg-black/20 transition-all flex-shrink-0 ml-2"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
