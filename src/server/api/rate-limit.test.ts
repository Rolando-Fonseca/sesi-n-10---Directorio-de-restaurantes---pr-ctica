import { beforeEach, describe, expect, it } from "vitest";
import { _resetRateLimit, clientIp, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => _resetRateLimit());

  it("permite hasta el límite y bloquea la siguiente en la misma ventana", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, t + i).allowed).toBe(true);
    const blocked = rateLimit("k", 3, t + 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });

  it("libera cuando la ventana de 60 s desliza", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) rateLimit("k", 3, t + i);
    expect(rateLimit("k", 3, t + 61_000).allowed).toBe(true);
  });

  it("las claves son independientes", () => {
    const t = 1_000_000;
    for (let i = 0; i < 3; i++) rateLimit("a", 3, t);
    expect(rateLimit("a", 3, t).allowed).toBe(false);
    expect(rateLimit("b", 3, t).allowed).toBe(true);
  });

  it("remaining decrece con cada petición", () => {
    const t = 1_000_000;
    expect(rateLimit("r", 5, t).remaining).toBe(4);
    expect(rateLimit("r", 5, t).remaining).toBe(3);
  });
});

describe("clientIp", () => {
  it("usa la primera IP de X-Forwarded-For y cae a local", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } }))).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "5.6.7.8" } }))).toBe("5.6.7.8");
    expect(clientIp(new Request("http://x"))).toBe("local");
  });
});
