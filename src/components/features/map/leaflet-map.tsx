"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { priceSymbol } from "@/lib/format";

export type MapPoint = { id: string; slug: string; name: string; latitude: number; longitude: number; averageRating?: number; priceRange?: string | null; cuisines?: string };

/** Marcador SVG en color de marca; evita los PNG por defecto de Leaflet, que los bundlers rompen. */
const pin = (active = false) =>
  L.divIcon({
    className: "",
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 39C15 39 28 24.5 28 14.5A13 13 0 0 0 2 14.5C2 24.5 15 39 15 39Z" fill="${active ? "#2d3436" : "#c9305f"}" stroke="#fff" stroke-width="2"/><circle cx="15" cy="14.5" r="5" fill="#fff"/></svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 39],
    popupAnchor: [0, -34],
  });

function FitBounds({ points, origin }: { points: MapPoint[]; origin?: { latitude: number; longitude: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const coords: [number, number][] = points.map((p) => [p.latitude, p.longitude]);
    if (origin) coords.push([origin.latitude, origin.longitude]);
    if (coords.length === 0) return;
    if (coords.length === 1) map.setView(coords[0], 15);
    else map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 });
  }, [map, points, origin]);
  return null;
}

type Props = { points: MapPoint[]; origin?: { latitude: number; longitude: number } | null; interactive?: boolean; className?: string; activeId?: string };

export default function LeafletMap({ points, origin, interactive = true, className, activeId }: Props) {
  const center: [number, number] = points[0] ? [points[0].latitude, points[0].longitude] : [40.4168, -3.7038];
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      className={className ?? "h-full w-full"}
      attributionControl
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds points={points} origin={origin} />
      {origin && (
        <Marker
          position={[origin.latitude, origin.longitude]}
          icon={L.divIcon({
            className: "",
            html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2d3436;border:3px solid #fff;box-shadow:0 0 0 6px rgba(45,52,54,.2)"></span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>Estás aquí</Popup>
        </Marker>
      )}
      {points.map((p) => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} icon={pin(p.id === activeId)}>
          <Popup>
            <div className="min-w-40">
              <Link href={`/restaurant/${p.slug}`} className="font-semibold text-foreground underline-offset-2 hover:underline">
                {p.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.cuisines}
                {p.priceRange ? ` · ${priceSymbol(p.priceRange)}` : ""}
                {p.averageRating ? ` · ${p.averageRating.toFixed(1).replace(".", ",")} ★` : ""}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
