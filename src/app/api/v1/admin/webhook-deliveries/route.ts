import { z } from "zod";
import { guardPrivate } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getWebhookDeliveries } from "@/server/queries/misc";

const q = z.object({ status: z.enum(["PENDING", "DELIVERED", "FAILED"]).optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(30) });

export const GET = handle(async (req) => {
  const headers = guardPrivate(req);
  const sp = new URL(req.url).searchParams;
  const { status, page, limit } = q.parse({ status: sp.get("status") ?? undefined, page: sp.get("page") ?? undefined, limit: sp.get("limit") ?? undefined });
  const result = await getWebhookDeliveries(status, page, limit);
  return ok(
    result.items.map((d) => ({ id: d.id, event: d.event, url: d.url, status: d.status, attempts: d.attempts, lastStatus: d.lastStatus, lastError: d.lastError, deliveredAt: d.deliveredAt?.toISOString() ?? null, createdAt: d.createdAt.toISOString() })),
    { page: result.page, limit: result.limit, total: result.total, pages: result.pages },
    { headers },
  );
});
