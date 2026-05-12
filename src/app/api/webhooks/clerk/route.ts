import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  const body = await req.text();
  const headerPayload = await headers();

  try {
    const evt = webhook.verify(body, {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    }) as {
      type: string;
      data: {
        id: string;
        email_addresses: { email_address: string }[];
        first_name?: string;
        last_name?: string;
        image_url?: string;
        public_metadata?: { role?: string };
      };
    };

    const { id, email_addresses, first_name, last_name, image_url, public_metadata } =
      evt.data;

    switch (evt.type) {
      case "user.created":
        await prisma.user.create({
          data: {
            id,
            email: email_addresses[0]?.email_address ?? "",
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
            role: (public_metadata?.role as "ADMIN" | "OWNER" | "USER") ?? "USER",
          },
        });
        break;

      case "user.updated":
        await prisma.user.update({
          where: { id },
          data: {
            email: email_addresses[0]?.email_address ?? "",
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
            role: (public_metadata?.role as "ADMIN" | "OWNER" | "USER") ?? undefined,
          },
        });
        break;

      case "user.deleted":
        await prisma.user.delete({ where: { id } }).catch(() => {});
        break;
    }

    return new Response("OK", { status: 200 });
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }
}
