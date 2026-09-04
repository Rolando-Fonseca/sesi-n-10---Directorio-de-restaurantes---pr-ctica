import { z } from "zod";
import { guardPrivate } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getReviewsSince } from "@/server/queries/reviews";

const q = z.object({ since: z.coerce.date().optional(), limit: z.coerce.number().int().min(1).max(500).default(200) });

export const GET = handle(async (req) => {
  const headers = guardPrivate(req);
  const sp = new URL(req.url).searchParams;
  const { since, limit } = q.parse({ since: sp.get("since") ?? undefined, limit: sp.get("limit") ?? undefined });
  const from = since ?? new Date(Date.now() - 7 * 86_400_000);
  const items = await getReviewsSince(from, limit);
  return ok(items, { total: items.length, since: from.toISOString() }, { headers });
});
