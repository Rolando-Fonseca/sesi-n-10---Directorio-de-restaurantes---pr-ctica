import { guardPublic } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getActivePlans } from "@/server/queries/misc";

export const GET = handle(async (req) => {
  const headers = guardPublic(req);
  const plans = await getActivePlans();
  return ok(
    plans.map((p) => ({ id: p.id, slug: p.slug, name: p.name, description: p.description, priceMonthly: p.priceMonthly, priceAnnual: p.priceAnnual, maxRestaurants: p.maxRestaurants, maxMenus: p.maxMenus, maxDishesPerMenu: p.maxDishesPerMenu, features: p.features })),
    { total: plans.length },
    { headers },
  );
});
