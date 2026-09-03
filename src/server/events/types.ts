/**
 * Eventos de dominio. El contrato público (nombres, cuerpo, cabeceras) está en
 * docs/api.md; este fichero es su versión tipada. Cambiar un evento aquí
 * obliga a cambiar el documento y, si rompe compatibilidad, la versión.
 */

export const EVENT_VERSION = 1;

export type RestaurantEventData = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  status: string;
  priceRange: string | null;
  owner: { id: string; email: string; name: string };
  publicUrl?: string;
  reason?: string;
};

export type DomainEventMap = {
  "user.created": { id: string; email: string; firstName: string | null; lastName: string | null; role: string };
  "user.became_owner": { id: string; email: string; firstName: string | null; lastName: string | null };
  "restaurant.created": RestaurantEventData;
  "restaurant.resubmitted": RestaurantEventData;
  "restaurant.approved": RestaurantEventData;
  "restaurant.rejected": RestaurantEventData;
  "menu.created": { id: string; title: string; ownerId: string; restaurantIds: string[] };
  "review.created": {
    id: string;
    restaurant: { id: string; slug: string; name: string; ownerEmail: string };
    author: { id: string; name: string };
    ratings: Record<string, number>;
    comment: string | null;
    average: number;
  };
  "subscription.activated": {
    id: string;
    userId: string;
    plan: string;
    interval: string;
    amount: number;
    currentPeriodEnd: string;
  };
  "webhook.test": { message: string; sentBy: string };
};

export type DomainEventName = keyof DomainEventMap;

export type DomainEventEnvelope<E extends DomainEventName = DomainEventName> = {
  id: string;
  event: E;
  version: typeof EVENT_VERSION;
  occurredAt: string;
  data: DomainEventMap[E];
};
