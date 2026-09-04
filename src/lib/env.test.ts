import { afterEach, describe, expect, it } from "vitest";
import { resolveAppUrl } from "./env";

const saved = { ...process.env };
afterEach(() => {
  for (const k of ["NEXT_PUBLIC_APP_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"]) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("resolveAppUrl", () => {
  it("usa NEXT_PUBLIC_APP_URL si tiene valor, sin barra final", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://foodzinder.example/";
    expect(resolveAppUrl()).toBe("https://foodzinder.example");
  });

  it("una variable vacía cuenta como ausente (el fallo del primer despliegue en Vercel)", () => {
    process.env.NEXT_PUBLIC_APP_URL = "";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "foodzinder.vercel.app";
    expect(resolveAppUrl()).toBe("https://foodzinder.vercel.app");
    expect(() => new URL(resolveAppUrl())).not.toThrow();
  });

  it("cae a VERCEL_URL y por último a localhost", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.VERCEL_URL = "foodzinder-abc123.vercel.app";
    expect(resolveAppUrl()).toBe("https://foodzinder-abc123.vercel.app");
    delete process.env.VERCEL_URL;
    expect(resolveAppUrl()).toBe("http://localhost:3000");
  });
});
