import { z } from "zod";
import { prisma } from "@/lib/db";
import { guardPublic } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getReviewsByRestaurant } from "@/server/queries/reviews";
import { notFound } from "@/server/services/errors";

const q = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(10) });

export const GET = handle(async (req, { params }: { params: Promise<{ slug: string }> }) => {
  const headers = guardPublic(req);
  const { slug } = await params;
  const sp = new URL(req.url).searchParams;
  const { page, limit } = q.parse({ page: sp.get("page") ?? undefined, limit: sp.get("limit") ?? undefined });
  const r = await prisma.restaurant.findFirst({ where: { slug, status: "APPROVED", isActive: true }, select: { id: true } });
  if (!r) throw notFound("El restaurante");
  const result = await getReviewsByRestaurant(r.id, page, limit);
  return ok(result.items, { page: result.page, limit: result.limit, total: result.total, pages: result.pages }, { headers });
});
