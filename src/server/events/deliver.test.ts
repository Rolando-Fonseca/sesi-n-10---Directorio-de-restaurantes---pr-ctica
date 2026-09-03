import { describe, expect, it, vi } from "vitest";
import { attemptDelivery } from "./deliver";
import { DELIVERY_HEADER, EVENT_HEADER, SIGNATURE_HEADER, verifySignature } from "./signature";

vi.mock("@/lib/db", () => ({ prisma: {} }));

const delivery = { id: "d-1", event: "review.created", url: "https://hook.example/x", payload: { hello: "mundo" }, attempts: 0 };

describe("attemptDelivery", () => {
  it("envía POST JSON con las tres cabeceras y una firma verificable", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
      captured = { url: String(url), init: init! };
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    const result = await attemptDelivery(delivery, "secreto", fetchImpl);

    expect(result).toEqual({ ok: true, status: 200, error: null });
    const { url, init } = captured!;
    expect(url).toBe(delivery.url);
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers[EVENT_HEADER]).toBe("review.created");
    expect(headers[DELIVERY_HEADER]).toBe("d-1");
    expect(verifySignature(init.body as string, headers[SIGNATURE_HEADER], "secreto")).toBe(true);
    expect(JSON.parse(init.body as string)).toEqual({ hello: "mundo" });
  });

  it("marca como fallo una respuesta no 2xx e informa del código", async () => {
    const fetchImpl = (async () => new Response("nope", { status: 503 })) as typeof fetch;
    expect(await attemptDelivery(delivery, "s", fetchImpl)).toEqual({ ok: false, status: 503, error: "HTTP 503" });
  });

  it("captura errores de red sin lanzar", async () => {
    const fetchImpl = (async () => {
      throw new Error("ECONNREFUSED");
    }) as typeof fetch;
    const result = await attemptDelivery(delivery, "s", fetchImpl);
    expect(result.ok).toBe(false);
    expect(result.status).toBeNull();
    expect(result.error).toContain("ECONNREFUSED");
  });
});
