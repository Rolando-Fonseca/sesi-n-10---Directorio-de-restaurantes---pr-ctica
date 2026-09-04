import { z } from "zod";
import { guardPublic } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { getTaxonomies } from "@/server/queries/taxonomies";

const q = z.object({ scope: z.enum(["RESTAURANT", "MENU_PRESENTATION", "MENU_ALLERGEN", "MENU_CATEGORY"]) });

export const GET = handle(async (req) => {
  const headers = guardPublic(req);
  const { scope } = q.parse({ scope: new URL(req.url).searchParams.get("scope") ?? undefined });
  const items = await getTaxonomies(scope);
  return ok(
    items.map((t) => ({ id: t.id, slug: t.slug, name: t.name, icon: t.icon, order: t.order, scope: t.scope })),
    { total: items.length },
    { headers },
  );
});
