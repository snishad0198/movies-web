"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Film } from "lucide-react";

interface LazyImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackText?: string;
  containerClassName?: string;
}

/**
 * Universal LazyImage Component
 * - Native Next.js lazy loading with loading="lazy"
 * - Shimmer wave skeleton placeholder during load (scetone loading)
 * - Smooth fade-in transition (opacity 0 -> 100)
 * - Safe fallback placeholder if image URL fails or is empty
 */
export function LazyImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = "",
  containerClassName = "",
  priority = false,
  fallbackText,
  ...rest
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // If no source or invalid
  const validSrc = typeof src === "string" && src.trim().length > 0 && !hasError ? src : null;

  return (
    <div
      className={`relative overflow-hidden ${
        fill ? "w-full h-full" : ""
      } ${containerClassName}`}
    >
      {/* 1. Shimmer Skeleton Loading State (Scetone Loading) */}
      {isLoading && validSrc && (
        <div className="absolute inset-0 z-10 skeleton-shimmer flex items-center justify-center">
          <Film className="w-6 h-6 text-white/10 animate-pulse" />
        </div>
      )}

      {/* 2. Error / Fallback State */}
      {(!validSrc || hasError) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#131320] border border-white/5 p-3 text-center">
          <Film className="w-8 h-8 text-white/20 mb-1.5" />
          <span className="text-[11px] font-semibold text-slate-400 line-clamp-2">
            {fallbackText || alt || "Poster Unavailable"}
          </span>
        </div>
      )}

      {/* 3. Next.js Optimized Image with Lazy Loading */}
      {validSrc && (
        <Image
          src={validSrc}
          alt={alt || "Movie poster"}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          sizes={sizes || "(max-width: 640px) 160px, (max-width: 1024px) 240px, 320px"}
          loading={priority ? undefined : "lazy"}
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
}

export default LazyImage;
