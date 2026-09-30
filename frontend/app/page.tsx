import React from "react";
import { headers } from "next/headers";
import { getHomepage, getGenres } from "@/lib/api";
import { HeroBanner } from "@/components/movies/HeroBanner";
import { HomeFeedView } from "@/components/home/HomeFeedView";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: {
    region?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const region = searchParams?.region;

  const headerStore = headers();
  const forwardHeaders: Record<string, string> = {};
  const acceptLang = headerStore.get("accept-language");
  if (acceptLang) forwardHeaders["accept-language"] = acceptLang;
  const cfCountry = headerStore.get("cf-ipcountry");
  if (cfCountry) forwardHeaders["cf-ipcountry"] = cfCountry;
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) forwardHeaders["x-forwarded-for"] = forwardedFor;
  const cookie = headerStore.get("cookie");
  if (cookie) forwardHeaders["cookie"] = cookie;

  const [homepageData, genres] = await Promise.all([
    getHomepage({ region, headers: forwardHeaders }),
    getGenres(),
  ]);

  const heroItems = homepageData?.hero || [];
  const rows = homepageData?.rows || [];
  const userRegion = homepageData?.userRegion;

  return (
    <div className="space-y-4 pb-16">
      {/* Dynamic Rotating Hero Banner */}
      {heroItems.length > 0 ? (
        <HeroBanner items={heroItems} />
      ) : (
        <div className="h-[60vh] bg-gradient-to-b from-[#141420] to-[#08080c] flex items-center justify-center text-center p-6">
          <div className="max-w-md space-y-3">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-white uppercase">
              Movies<span className="text-[#e50914]">.snishad</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Discover, stream, and download the world&apos;s best cinema in HD.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Category Feed with Region Detection & Continue Watching */}
      <HomeFeedView
        initialRows={rows}
        genres={genres || []}
        userRegion={userRegion}
      />
    </div>
  );
}
