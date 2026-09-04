import { z } from "zod";
import { guardPrivate } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getRestaurantsByStatus } from "@/server/queries/restaurants";

const q = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED", "ARCHIVED"]).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });

export const GET = handle(async (req) => {
  const headers = guardPrivate(req);
  const sp = new URL(req.url).searchParams;
  const { status, page, limit } = q.parse({ status: sp.get("status") ?? undefined, page: sp.get("page") ?? undefined, limit: sp.get("limit") ?? undefined });
  const result = await getRestaurantsByStatus(status, page, limit);
  return ok(
    result.items.map((r) => ({
      id: r.id, slug: r.slug, name: r.name, city: r.city, status: r.status, priceRange: r.priceRange, rejectionReason: r.rejectionReason,
      createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(),
      cuisines: r.taxonomies.filter((t) => t.taxonomy.order < 20).map((t) => ({ slug: t.taxonomy.slug, name: t.taxonomy.name })),
      owner: { id: r.owner.id, email: r.owner.email, name: [r.owner.firstName, r.owner.lastName].filter(Boolean).join(" ") || r.owner.email },
    })),
    { page: result.page, limit: result.limit, total: result.total, pages: result.pages },
    { headers },
  );
});
