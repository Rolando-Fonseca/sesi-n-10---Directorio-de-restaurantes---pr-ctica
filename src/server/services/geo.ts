import { haversineDistance } from "@/lib/geolocation";

export type GeoPoint = { latitude: number; longitude: number };
export type Located<T> = T & { distanceKm: number };

/**
 * Anota cada elemento con su distancia al origen, descarta los que superan el
 * radio y ordena de más cercano a más lejano. Distancia redondeada a 100 m.
 */
export function annotateAndFilterByDistance<T extends GeoPoint>(items: T[], origin: GeoPoint, radiusKm: number): Located<T>[] {
  return items
    .map((item) => ({
      ...item,
      distanceKm: Math.round(haversineDistance(origin.latitude, origin.longitude, item.latitude, item.longitude) * 10) / 10,
    }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Tiempo estimado a pie a 4,5 km/h, en minutos. */
export function walkingMinutes(distanceKm: number): number {
  return Math.max(1, Math.round((distanceKm / 4.5) * 60));
}
