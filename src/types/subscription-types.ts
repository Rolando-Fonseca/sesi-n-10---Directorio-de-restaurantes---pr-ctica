export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceAnnual: number;
  maxRestaurants: number;
  maxMenus: number;
  maxDishesPerMenu: number;
  features: Record<string, boolean | number | string>;
};

export type CheckoutSessionInput = {
  planId: string;
  provider: "STRIPE" | "PAYPAL";
  interval: "monthly" | "annual";
  couponCode?: string;
};
