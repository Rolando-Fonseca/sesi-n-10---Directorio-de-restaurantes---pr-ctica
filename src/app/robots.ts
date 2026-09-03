import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.appUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api", "/sign-in", "/sign-up", "/legal"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
