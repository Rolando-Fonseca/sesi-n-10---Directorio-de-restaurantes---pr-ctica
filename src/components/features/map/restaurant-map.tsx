"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapPoint } from "./leaflet-map";

/** Leaflet solo existe en el navegador: se carga sin SSR desde este envoltorio cliente. */
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-xl" />,
});

export function RestaurantMap(props: { points: MapPoint[]; origin?: { latitude: number; longitude: number } | null; interactive?: boolean; className?: string; activeId?: string }) {
  return <LeafletMap {...props} />;
}

export type { MapPoint };
