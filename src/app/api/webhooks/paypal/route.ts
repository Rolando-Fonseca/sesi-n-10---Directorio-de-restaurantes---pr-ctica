
export async function POST() {
  // TODO: Verify PayPal webhook signature and process events
  // - BILLING.SUBSCRIPTION.ACTIVATED
  // - BILLING.SUBSCRIPTION.CANCELLED
  // - PAYMENT.SALE.COMPLETED

  return new Response("OK", { status: 200 });
}
