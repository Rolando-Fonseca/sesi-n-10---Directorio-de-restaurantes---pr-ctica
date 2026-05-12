import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();

  // TODO: Verify PayPal webhook signature and process events
  // - BILLING.SUBSCRIPTION.ACTIVATED
  // - BILLING.SUBSCRIPTION.CANCELLED
  // - PAYMENT.SALE.COMPLETED

  return new Response("OK", { status: 200 });
}
