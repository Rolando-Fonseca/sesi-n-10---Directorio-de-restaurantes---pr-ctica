import { z } from "zod";
import { guardPublic } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { searchRestaurants } from "@/server/queries/restaurants";

const PRICES = ["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"] as const;

const querySchema = z.object({
  query: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  cuisine: z.array(z.string()).default([]),
  feature: z.array(z.string()).default([]),
  price: z.array(z.enum(PRICES)).default([]),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0.5).max(100).default(10),
  sort: z.enum(["rating", "distance", "recent", "name"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = handle(async (req) => {
  const headers = guardPublic(req);
  const sp = new URL(req.url).searchParams;
  const p = querySchema.parse({
    query: sp.get("query") ?? undefined,
    city: sp.get("city") ?? undefined,
    cuisine: sp.getAll("cuisine"),
    feature: sp.getAll("feature"),
    price: sp.getAll("price"),
    lat: sp.get("lat") ?? undefined,
    lng: sp.get("lng") ?? undefined,
    radius: sp.get("radius") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    page: sp.get("page") ?? undefined,
    limit: sp.get("limit") ?? undefined,
  });
  if ((p.lat == null) !== (p.lng == null)) return ok([], { page: 1, limit: p.limit, total: 0, pages: 0, warning: "lat y lng deben ir juntos" }, { headers });
  const result = await searchRestaurants(p);
  return ok(result.items, { page: result.page, limit: result.limit, total: result.total, pages: result.pages }, { headers });
});
