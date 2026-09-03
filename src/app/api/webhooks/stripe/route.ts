import { headers } from "next/headers";

export async function POST(req: Request) {
  await req.text(); // el cuerpo se leerá al verificar la firma
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  // TODO: Verify Stripe webhook signature and process events
  // - customer.subscription.created
  // - customer.subscription.updated
  // - customer.subscription.deleted
  // - invoice.paid
  // - invoice.payment_failed

  return new Response("OK", { status: 200 });
}
