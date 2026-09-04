import { z } from "zod";
import { apiActor, guardPrivate } from "@/server/api/guards";
import { handle, ok, readJson } from "@/server/api/respond";
import { transitionRestaurant } from "@/server/services/restaurants";

const body = z.object({ reason: z.string().min(10, "Explica el motivo con al menos 10 caracteres").max(1000) });

export const POST = handle(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const headers = guardPrivate(req);
  const { id } = await params;
  z.string().uuid().parse(id);
  const { reason } = body.parse(await readJson(req));
  const r = await transitionRestaurant(await apiActor(), id, "REJECTED", reason);
  return ok({ id: r.id, slug: r.slug, status: r.status, rejectionReason: r.rejectionReason }, undefined, { headers });
});
