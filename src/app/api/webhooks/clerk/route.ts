import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";
import { registerUserFromClerk } from "@/server/services/users";

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted" | string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    public_metadata?: { role?: "ADMIN" | "OWNER" | "USER" };
  };
};

/**
 * Único webhook entrante (ADR-0002): mantiene la tabla users sincronizada con
 * Clerk. Firmado con Svix; sin firma válida responde 401.
 */
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("CLERK_WEBHOOK_SECRET no configurado", { status: 500 });

  const body = await req.text();
  const h = await headers();
  let evt: ClerkUserEvent;
  try {
    evt = new Webhook(secret).verify(body, {
      "svix-id": h.get("svix-id") ?? "",
      "svix-timestamp": h.get("svix-timestamp") ?? "",
      "svix-signature": h.get("svix-signature") ?? "",
    }) as ClerkUserEvent;
  } catch {
    return new Response("Firma inválida", { status: 401 });
  }

  const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

  switch (evt.type) {
    case "user.created":
    case "user.updated":
      await registerUserFromClerk({
        id,
        email: email_addresses?.[0]?.email_address ?? "",
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        role: public_metadata?.role,
      });
      break;
    case "user.deleted":
      await prisma.user.delete({ where: { id } }).catch(() => {});
      break;
  }

  return new Response("OK", { status: 200 });
}
