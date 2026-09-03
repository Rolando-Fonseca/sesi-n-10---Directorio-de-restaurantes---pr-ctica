import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getPublishedSlugs } from "@/server/queries/restaurants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl();
  const restaurants = await getPublishedSlugs();
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.5 },
    ...restaurants.map((r) => ({ url: `${base}/restaurant/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
