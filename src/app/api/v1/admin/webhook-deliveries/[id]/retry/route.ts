import { z } from "zod";
import { guardPrivate } from "@/server/api/guards";
import { handle, ok } from "@/server/api/respond";
import { retryDelivery } from "@/server/events/deliver";
import { notFound } from "@/server/services/errors";

export const POST = handle(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const headers = guardPrivate(req);
  const { id } = await params;
  z.string().uuid().parse(id);
  const result = await retryDelivery(id);
  if (!result) throw notFound("La entrega");
  return ok(result, undefined, { headers });
});
