"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const icon = L.divIcon({
  className: "",
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 39C15 39 28 24.5 28 14.5A13 13 0 0 0 2 14.5C2 24.5 15 39 15 39Z" fill="#c9305f" stroke="#fff" stroke-width="2"/><circle cx="15" cy="14.5" r="5" fill="#fff"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 39],
});

type Props = { value: { latitude: number; longitude: number } | null; onChange: (v: { latitude: number; longitude: number }) => void };

function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
  useMapEvents({ click: (e) => onChange({ latitude: Number(e.latlng.lat.toFixed(6)), longitude: Number(e.latlng.lng.toFixed(6)) }) });
  return null;
}

function Recenter({ value }: { value: Props["value"] }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView([value.latitude, value.longitude], Math.max(map.getZoom(), 15));
  }, [map, value]);
  return null;
}

/** Mapa para fijar o ajustar la posición: clic para colocar, arrastrar para afinar. */
export default function LeafletPicker({ value, onChange }: Props) {
  const center: [number, number] = value ? [value.latitude, value.longitude] : [40.4168, -3.7038];
  return (
    <MapContainer center={center} zoom={value ? 15 : 6} className="h-full w-full" scrollWheelZoom>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onChange={onChange} />
      <Recenter value={value} />
      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={icon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange({ latitude: Number(p.lat.toFixed(6)), longitude: Number(p.lng.toFixed(6)) });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
