import { describe, expect, it } from "vitest";
import { signPayload, verifySignature } from "./signature";

const secret = "s3cr3t-de-prueba";
const body = JSON.stringify({ event: "restaurant.created", data: { id: "1" } });

describe("firma de webhooks", () => {
  it("produce el formato sha256=<hex> documentado en docs/api.md", () => {
    expect(signPayload(body, secret)).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("es determinista para el mismo cuerpo y secreto", () => {
    expect(signPayload(body, secret)).toBe(signPayload(body, secret));
  });

  it("verifica una firma correcta", () => {
    expect(verifySignature(body, signPayload(body, secret), secret)).toBe(true);
  });

  it("rechaza si el cuerpo cambia aunque sea un carácter", () => {
    const sig = signPayload(body, secret);
    expect(verifySignature(body + " ", sig, secret)).toBe(false);
  });

  it("rechaza con otro secreto", () => {
    expect(verifySignature(body, signPayload(body, secret), "otro")).toBe(false);
  });

  it("rechaza firmas ausentes, vacías o con formato distinto sin lanzar", () => {
    expect(verifySignature(body, null, secret)).toBe(false);
    expect(verifySignature(body, "", secret)).toBe(false);
    expect(verifySignature(body, "sha256=abc", secret)).toBe(false);
    expect(verifySignature(body, signPayload(body, secret), "")).toBe(false);
  });
});
