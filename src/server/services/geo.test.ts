import { describe, expect, it } from "vitest";
import { boundingBox, haversineDistance } from "@/lib/geolocation";
import { annotateAndFilterByDistance, walkingMinutes } from "./geo";

// Puerta del Sol y Plaza de Cibeles distan unos 1,1 km.
const sol = { latitude: 40.4169, longitude: -3.7035 };
const cibeles = { latitude: 40.4193, longitude: -3.6931 };
const barcelona = { latitude: 41.3874, longitude: 2.1686 };

describe("haversineDistance", () => {
  it("Sol a Cibeles ronda el kilómetro", () => {
    const d = haversineDistance(sol.latitude, sol.longitude, cibeles.latitude, cibeles.longitude);
    expect(d).toBeGreaterThan(0.8);
    expect(d).toBeLessThan(1.3);
  });

  it("Madrid a Barcelona ronda los 505 km", () => {
    const d = haversineDistance(sol.latitude, sol.longitude, barcelona.latitude, barcelona.longitude);
    expect(d).toBeGreaterThan(495);
    expect(d).toBeLessThan(515);
  });
});

describe("boundingBox", () => {
  it("contiene los puntos dentro del radio", () => {
    const box = boundingBox(sol.latitude, sol.longitude, 2);
    expect(cibeles.latitude).toBeGreaterThan(box.minLat);
    expect(cibeles.latitude).toBeLessThan(box.maxLat);
    expect(cibeles.longitude).toBeGreaterThan(box.minLon);
    expect(cibeles.longitude).toBeLessThan(box.maxLon);
    expect(barcelona.latitude).toBeGreaterThan(box.maxLat);
  });
});

describe("annotateAndFilterByDistance", () => {
  it("anota distancia, filtra por radio y ordena de cerca a lejos", () => {
    const items = [
      { id: "bcn", ...barcelona },
      { id: "cibeles", ...cibeles },
      { id: "sol", ...sol },
    ];
    const result = annotateAndFilterByDistance(items, sol, 5);
    expect(result.map((r) => r.id)).toEqual(["sol", "cibeles"]);
    expect(result[0].distanceKm).toBe(0);
    expect(result[1].distanceKm).toBeCloseTo(1.1, 0);
  });
});

describe("walkingMinutes", () => {
  it("a 4,5 km/h, 1,5 km son 20 minutos y nunca devuelve 0", () => {
    expect(walkingMinutes(1.5)).toBe(20);
    expect(walkingMinutes(0)).toBe(1);
  });
});
