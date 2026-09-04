import { z } from "zod";
import { apiActor, guardPrivate } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { transitionRestaurant } from "@/server/services/restaurants";

export const POST = handle(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const headers = guardPrivate(req);
  const { id } = await params;
  z.string().uuid().parse(id);
  const r = await transitionRestaurant(await apiActor(), id, "APPROVED");
  return ok({ id: r.id, slug: r.slug, status: r.status }, undefined, { headers });
});
