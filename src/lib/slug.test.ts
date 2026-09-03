import { describe, expect, it } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("pasa a minúsculas y sustituye espacios por guiones", () => {
    expect(generateSlug("Casa Lucio")).toBe("casa-lucio");
  });

  it("quita tildes y eñes sin perder la letra base", () => {
    expect(generateSlug("Asador Señorío de Bertiz")).toBe("asador-senorio-de-bertiz");
  });

  it("colapsa símbolos consecutivos y no deja guiones en los extremos", () => {
    expect(generateSlug("  ¡El Bar & Tapas!  ")).toBe("el-bar-tapas");
  });

  it("devuelve cadena vacía si no queda nada útil", () => {
    expect(generateSlug("¡¡¡")).toBe("");
  });
});
