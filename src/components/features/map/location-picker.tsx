"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const LeafletPicker = dynamic(() => import("./leaflet-picker"), { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> });

type Coords = { latitude: number; longitude: number };
type Props = { value: Coords | null; onChange: (v: Coords | null) => void; address: string; city: string };

/**
 * Selector de posición. "Buscar la dirección" consulta Nominatim desde el
 * navegador para previsualizar; el servidor vuelve a geocodificar si el
 * formulario llega sin coordenadas.
 */
export function LocationPicker({ value, onChange, address, city }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function locate() {
    if (!address.trim()) {
      setMsg("Escribe primero la dirección.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const q = encodeURIComponent([address, city, "España"].filter(Boolean).join(", "));
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&limit=1&countrycodes=es`, { headers: { Accept: "application/json" } });
      const data = (await res.json()) as { lat: string; lon: string; display_name: string }[];
      if (!data[0]) {
        setMsg("No se ha encontrado. Haz clic en el mapa para colocar el marcador a mano.");
        return;
      }
      onChange({ latitude: Number(data[0].lat), longitude: Number(data[0].lon) });
      setMsg(`Encontrado: ${data[0].display_name}`);
    } catch {
      setMsg("No se ha podido consultar el mapa. Coloca el marcador a mano.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={locate} disabled={busy}>
          <LocateFixed data-icon="inline-start" />
          {busy ? "Buscando…" : "Buscar la dirección en el mapa"}
        </Button>
        {value && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
          </span>
        )}
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Quitar marcador
          </Button>
        )}
      </div>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      <div className="h-64 overflow-hidden rounded-xl ring-1 ring-border">
        <LeafletPicker value={value} onChange={onChange} />
      </div>
      <p className="text-xs text-muted-foreground">Haz clic en el mapa para colocar el marcador y arrástralo para afinar. Si lo dejas vacío, lo calculamos a partir de la dirección.</p>
    </div>
  );
}
