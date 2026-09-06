import { z } from "zod";
import { guardPrivate } from "@/server/api/guards";
import { handle, ok, readJson } from "@/server/api/respond";
import { sendEmail } from "@/server/services/email";

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(200_000),
  text: z.string().max(200_000).optional(),
});

/**
 * Relevo de correo transaccional para n8n (P5): el plan gratuito de Render
 * bloquea el SMTP saliente, Vercel no. n8n compone el correo y lo envía aquí.
 */
export const POST = handle(async (req) => {
  const headers = guardPrivate(req);
  const input = schema.parse(await readJson(req));
  const result = await sendEmail(input);
  return ok(result, undefined, { headers });
});
