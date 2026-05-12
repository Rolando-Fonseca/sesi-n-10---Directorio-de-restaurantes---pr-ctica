export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function reverseGeocode(lat: number, lon: number) {
  const url = `${process.env.NEXT_PUBLIC_NOMINATIM_URL ?? "https://nominatim.openstreetmap.org"}/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Foodzinder/1.0" },
  });
  if (!res.ok) return null;
  return res.json();
}
