import { z } from "zod";
import { guardPrivate } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getStats } from "@/server/queries/misc";

const q = z.object({ period: z.string().regex(/^\d{1,3}d$/, "Formato: 7d, 30d…").default("7d") });

export const GET = handle(async (req) => {
  const headers = guardPrivate(req);
  const { period } = q.parse({ period: new URL(req.url).searchParams.get("period") ?? undefined });
  const days = Number(period.slice(0, -1));
  return ok(await getStats(days), undefined, { headers });
});
