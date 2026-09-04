import { guardPublic } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getRestaurantBySlug } from "@/server/queries/restaurants";
import { notFound } from "@/server/services/errors";

export const GET = handle(async (req, { params }: { params: Promise<{ slug: string }> }) => {
  const headers = guardPublic(req);
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) throw notFound("El restaurante");
  return ok(r, undefined, { headers });
});
