// Uso: node scripts/screenshots.mjs (requiere playwright y el servidor en BASE_URL). Recorre cada página con scroll y captura en docs/screenshots/.
// Recorre cada página con scroll (para disparar los revelados) y captura página completa.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const PAGES = [
  ["/", "home"],
  ["/explore", "explore"],
  ["/restaurant/casa-terral", "restaurant"],
];
const SIZES = [
  [1440, 900],
  [768, 1024],
  [375, 812],
];

const browser = await chromium.launch();
for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: "es-ES" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const [path, name] of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.7)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(180);
    }
    await page.waitForTimeout(900);
    const hidden = await page.evaluate(() => document.querySelectorAll(".reveal:not(.is-visible)").length);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `docs/screenshots/${name}-${w}.png`, fullPage: true });
    console.log(`${name}-${w}: alto=${total}px, revelados ocultos=${hidden}`);
  }
  if (errors.length) console.log(`errores consola @${w}:`, errors);
  await ctx.close();
}
await browser.close();
