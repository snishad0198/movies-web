import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://movies.snishad.com";
  const now = new Date();

  const routes = [
    "",
    "/movies",
    "/series",
    "/trending",
    "/anime",
    "/new",
    "/search",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
