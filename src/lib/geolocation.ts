import { env } from "./env";

const USER_AGENT = "Foodzinder/1.0 (directorio academico; contacto: soporte@foodzinder.dev)";

/** Distancia en kilómetros entre dos coordenadas (fórmula de Haversine). */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Caja delimitadora aproximada alrededor de un punto, para acotar la consulta
 * SQL antes de calcular la distancia exacta. Radio en km.
 */
export function boundingBox(lat: number, lon: number, radiusKm: number) {
  const dLat = radiusKm / 111.32;
  const dLon = radiusKm / (111.32 * Math.cos(toRad(lat)) || 1);
  return { minLat: lat - dLat, maxLat: lat + dLat, minLon: lon - dLon, maxLon: lon + dLon };
}

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
  city: string | null;
  postalCode: string | null;
};

/**
 * Geocodifica una dirección con Nominatim (OpenStreetMap). Devuelve null si
 * no hay resultado o el servicio falla; el llamador decide qué hacer.
 * Nominatim pide un User-Agent identificativo y máximo una petición por segundo.
 */
export async function geocodeAddress(address: string, city?: string | null): Promise<GeocodeResult | null> {
  const q = [address, city, "España"].filter(Boolean).join(", ");
  const url = `${env.nominatimUrl()}/search?q=${encodeURIComponent(q)}&format=jsonv2&addressdetails=1&limit=1&countrycodes=es&accept-language=es`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
      address?: { city?: string; town?: string; village?: string; municipality?: string; postcode?: string };
    }>;
    const hit = data[0];
    if (!hit) return null;
    const a = hit.address ?? {};
    return {
      latitude: Number(hit.lat),
      longitude: Number(hit.lon),
      displayName: hit.display_name,
      city: a.city ?? a.town ?? a.village ?? a.municipality ?? null,
      postalCode: a.postcode ?? null,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lon: number) {
  const url = `${env.nominatimUrl()}/reverse?lat=${lat}&lon=${lon}&format=jsonv2&accept-language=es`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return (await res.json()) as { display_name: string; address?: Record<string, string> };
  } catch {
    return null;
  }
}
