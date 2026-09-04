/**
 * Tests de contrato de /api/v1 (docs/api.md). Ejecutan los route handlers
 * directamente con objetos Request contra la base de datos de desarrollo
 * (datos del seed). Se saltan si no hay DATABASE_URL.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const hasDb = Boolean(process.env.DATABASE_URL);
const API_KEY = "clave-de-test";
process.env.FOODZINDER_API_KEY = API_KEY;
process.env.WEBHOOK_URLS = ""; // sin entregas reales durante los tests

const BASE = "http://test.local/api/v1";
const get = (path: string, headers: Record<string, string> = {}) => new Request(BASE + path, { headers });
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(BASE + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
const params = <T extends object>(p: T) => ({ params: Promise.resolve(p) });

describe.skipIf(!hasDb)("API v1 pública", () => {
  beforeEach(async () => (await import("@/server/api/rate-limit"))._resetRateLimit());

  it("GET /restaurants devuelve la envoltura con meta y solo restaurantes publicados", async () => {
    const { GET } = await import("@/app/api/v1/restaurants/route");
    const res = await GET(get("/restaurants?limit=5"), {});
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ratelimit-limit")).toBe("60");
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.meta).toMatchObject({ page: 1, limit: 5 });
    expect(json.meta.total).toBeGreaterThan(0);
    expect(json.data.length).toBeLessThanOrEqual(5);
    for (const r of json.data) {
      expect(r).toMatchObject({ id: expect.any(String), slug: expect.any(String), name: expect.any(String), latitude: expect.any(Number), longitude: expect.any(Number) });
      expect(Array.isArray(r.cuisines)).toBe(true);
    }
    expect(json.data.some((r: { slug: string }) => r.slug === "gracia-verde")).toBe(false); // PENDING no aparece
  });

  it("GET /restaurants con lat/lng anota distanceKm y ordena por cercanía", async () => {
    const { GET } = await import("@/app/api/v1/restaurants/route");
    const json = await (await GET(get("/restaurants?lat=40.4169&lng=-3.7035&radius=5"), {})).json();
    expect(json.data.length).toBeGreaterThan(0);
    const d = json.data.map((r: { distanceKm: number }) => r.distanceKm);
    expect(d).toEqual([...d].sort((a, b) => a - b));
    expect(json.data.every((r: { distanceKm: number }) => r.distanceKm <= 5)).toBe(true);
  });

  it("GET /restaurants rechaza un precio inválido con 400 y código", async () => {
    const { GET } = await import("@/app/api/v1/restaurants/route");
    const res = await GET(get("/restaurants?price=GRATIS"), {});
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false, code: "VALIDATION_ERROR" });
  });

  it("GET /restaurants/{slug} devuelve el detalle con carta, alérgenos y desglose", async () => {
    const { GET } = await import("@/app/api/v1/restaurants/[slug]/route");
    const json = await (await GET(get("/restaurants/casa-terral"), params({ slug: "casa-terral" }))).json();
    expect(json.success).toBe(true);
    expect(json.data.menus.length).toBeGreaterThan(0);
    const dish = json.data.menus[0].categories[0].dishes[0];
    expect(dish).toMatchObject({ id: expect.any(String), name: expect.any(String), price: expect.any(Number) });
    expect(Array.isArray(dish.allergens)).toBe(true);
    expect(json.data.ratingBreakdown).toHaveProperty("FOOD");
  });

  it("GET /restaurants/{slug} da 404 para pendientes e inexistentes", async () => {
    const { GET } = await import("@/app/api/v1/restaurants/[slug]/route");
    expect((await GET(get("/restaurants/gracia-verde"), params({ slug: "gracia-verde" }))).status).toBe(404);
    const res = await GET(get("/restaurants/no-existe"), params({ slug: "no-existe" }));
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ success: false, code: "NOT_FOUND" });
  });

  it("GET /restaurants/{slug}/reviews pagina las reseñas", async () => {
    const { GET } = await import("@/app/api/v1/restaurants/[slug]/reviews/route");
    const json = await (await GET(get("/restaurants/casa-terral/reviews?limit=2"), params({ slug: "casa-terral" }))).json();
    expect(json.data.length).toBe(2);
    expect(json.meta.total).toBeGreaterThanOrEqual(3);
    expect(json.data[0]).toMatchObject({ average: expect.any(Number), author: { name: expect.any(String) }, ratings: expect.any(Object) });
  });

  it("GET /taxonomies exige scope y devuelve los 14 alérgenos", async () => {
    const { GET } = await import("@/app/api/v1/taxonomies/route");
    expect((await GET(get("/taxonomies"), {})).status).toBe(400);
    const json = await (await GET(get("/taxonomies?scope=MENU_ALLERGEN"), {})).json();
    expect(json.data).toHaveLength(14);
  });

  it("GET /plans devuelve los tres planes con precios numéricos", async () => {
    const { GET } = await import("@/app/api/v1/plans/route");
    const json = await (await GET(get("/plans"), {})).json();
    expect(json.data.map((p: { slug: string }) => p.slug)).toEqual(["basico", "pro", "premium"]);
    expect(typeof json.data[0].priceMonthly).toBe("number");
  });

  it("aplica el límite de 60 peticiones por minuto e informa con 429", async () => {
    const { GET } = await import("@/app/api/v1/plans/route");
    const h = { "x-forwarded-for": "9.9.9.9" };
    for (let i = 0; i < 60; i++) expect((await GET(get("/plans", h), {})).status).toBe(200);
    const res = await GET(get("/plans", h), {});
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBeTruthy();
    expect(await res.json()).toMatchObject({ success: false, code: "RATE_LIMITED" });
  });
});

describe.skipIf(!hasDb)("API v1 privada", () => {
  const auth = { "x-api-key": API_KEY };
  let prisma: (typeof import("@/lib/db"))["prisma"];
  let testRestaurantId: string;

  beforeAll(async () => {
    prisma = (await import("@/lib/db")).prisma;
    const owner = await prisma.user.findFirstOrThrow({ where: { role: "OWNER" } });
    const r = await prisma.restaurant.create({
      data: { ownerId: owner.id, name: "Test API Contrato", slug: `test-api-${Date.now()}`, address: "Calle Falsa 123", city: "Madrid", latitude: 40.4, longitude: -3.7, status: "PENDING" },
    });
    testRestaurantId = r.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { referenceId: testRestaurantId } });
    await prisma.restaurant.delete({ where: { id: testRestaurantId } }).catch(() => {});
  });

  beforeEach(async () => (await import("@/server/api/rate-limit"))._resetRateLimit());

  it("sin clave responde 401 y con clave incorrecta también", async () => {
    const { GET } = await import("@/app/api/v1/admin/stats/route");
    expect((await GET(get("/admin/stats"), {})).status).toBe(401);
    expect((await GET(get("/admin/stats", { "x-api-key": "otra" }), {})).status).toBe(401);
  });

  it("GET /admin/stats devuelve los bloques documentados", async () => {
    const { GET } = await import("@/app/api/v1/admin/stats/route");
    const res = await GET(get("/admin/stats?period=30d", auth), {});
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ratelimit-limit")).toBe("120");
    const json = await res.json();
    expect(json.data).toMatchObject({ period: { days: 30 }, users: expect.any(Object), restaurants: expect.any(Object), reviews: expect.any(Object), webhooks: expect.any(Object) });
    expect((await GET(get("/admin/stats?period=ayer", auth), {})).status).toBe(400);
  });

  it("GET /admin/restaurants?status=PENDING incluye el restaurante de prueba con su dueño", async () => {
    const { GET } = await import("@/app/api/v1/admin/restaurants/route");
    const json = await (await GET(get("/admin/restaurants?status=PENDING", auth), {})).json();
    const mine = json.data.find((r: { id: string }) => r.id === testRestaurantId);
    expect(mine).toMatchObject({ status: "PENDING", owner: { email: expect.any(String) } });
  });

  it("POST reject exige motivo, y luego approve no es posible desde REJECTED", async () => {
    const { POST: reject } = await import("@/app/api/v1/admin/restaurants/[id]/reject/route");
    const { POST: approve } = await import("@/app/api/v1/admin/restaurants/[id]/approve/route");
    const p = params({ id: testRestaurantId });
    const bad = await reject(post(`/admin/restaurants/${testRestaurantId}/reject`, { reason: "corto" }, auth), p);
    expect(bad.status).toBe(400);
    const ok = await reject(post(`/admin/restaurants/${testRestaurantId}/reject`, { reason: "La dirección no existe en el callejero" }, auth), p);
    expect(ok.status).toBe(200);
    expect((await ok.json()).data.status).toBe("REJECTED");
    const conflict = await approve(post(`/admin/restaurants/${testRestaurantId}/approve`, {}, auth), p);
    expect(conflict.status).toBe(409);
    expect((await conflict.json()).code).toBe("INVALID_TRANSITION");
  });

  it("POST approve publica un restaurante pendiente", async () => {
    await prisma.restaurant.update({ where: { id: testRestaurantId }, data: { status: "PENDING" } });
    const { POST: approve } = await import("@/app/api/v1/admin/restaurants/[id]/approve/route");
    const res = await approve(post(`/admin/restaurants/${testRestaurantId}/approve`, {}, auth), params({ id: testRestaurantId }));
    expect(res.status).toBe(200);
    expect((await res.json()).data.status).toBe("APPROVED");
    const notif = await prisma.notification.findFirst({ where: { referenceId: testRestaurantId, type: "RESTAURANT_APPROVED" } });
    expect(notif).not.toBeNull();
  });

  it("approve con id inexistente da 404 y con id no UUID da 400", async () => {
    const { POST: approve } = await import("@/app/api/v1/admin/restaurants/[id]/approve/route");
    const missing = "00000000-0000-4000-8000-000000000000";
    expect((await approve(post(`/admin/restaurants/${missing}/approve`, {}, auth), params({ id: missing }))).status).toBe(404);
    expect((await approve(post(`/admin/restaurants/abc/approve`, {}, auth), params({ id: "abc" }))).status).toBe(400);
  });

  it("GET /admin/reviews?since= devuelve reseñas con restaurante y autor", async () => {
    const { GET } = await import("@/app/api/v1/admin/reviews/route");
    const json = await (await GET(get("/admin/reviews?since=2020-01-01", auth), {})).json();
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0]).toMatchObject({ restaurant: { slug: expect.any(String) }, author: { name: expect.any(String) } });
  });

  it("GET /admin/webhook-deliveries responde con paginación aunque esté vacío", async () => {
    const { GET } = await import("@/app/api/v1/admin/webhook-deliveries/route");
    const json = await (await GET(get("/admin/webhook-deliveries?status=FAILED", auth), {})).json();
    expect(json.success).toBe(true);
    expect(json.meta).toMatchObject({ page: 1 });
  });
});
