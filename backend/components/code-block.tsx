"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  onTest?: (endpoint: string) => void;
}

export function CodeBlock({ children, className, onTest }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const textContent = typeof children === "string" ? children : String(children || "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isLinkable =
    textContent.startsWith("/") ||
    textContent.startsWith("http://") ||
    textContent.startsWith("https://");

  const href = textContent.startsWith("/")
    ? textContent
    : textContent.startsWith("http")
    ? textContent
    : undefined;

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between rounded-xl neu-inset p-3.5 font-mono text-sm transition-all duration-200",
        className
      )}
    >
      <div className="overflow-x-auto whitespace-nowrap pr-28 scrollbar-thin text-cyan-200/90 selection:bg-cyan-500/20 font-medium">
        <code>{children}</code>
      </div>

      <div className="absolute right-2 flex items-center space-x-1.5 bg-[#0e1420]/90 backdrop-blur-md pl-2 py-1 rounded-lg border border-white/5">
        {onTest && isLinkable && (
          <button
            onClick={() => onTest(textContent)}
            type="button"
            title="Test in live playground"
            className="neu-btn inline-flex h-7 items-center space-x-1 px-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 rounded-lg cursor-pointer transition-all"
            aria-label="Test endpoint"
          >
            <Play className="h-3 w-3 fill-current" aria-hidden="true" />
            <span className="hidden md:inline">Test</span>
          </button>
        )}

        {isLinkable && href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title="Open endpoint in new tab"
            className="neu-btn inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}

        <button
          onClick={handleCopy}
          type="button"
          title={copied ? "Copied!" : "Copy endpoint"}
          className={cn(
            "neu-btn inline-flex h-7 items-center space-x-1 px-2.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer",
            copied
              ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/20"
              : "text-slate-300 hover:text-white"
          )}
          aria-label={copied ? "Copied to clipboard" : "Copy endpoint"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
