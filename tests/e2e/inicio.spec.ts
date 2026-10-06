import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SECCIONES = ["historia", "lo-nuevo", "lo-proximo", "ya-no-hay", "como-conseguirlo", "colaboraciones"];
const PROHIBIDAS = [/drop \d/i, /\[NÚMERO\]/, /carrito/i, /comprar/i, /oferta/i, /descuento/i, /rebajas/i, /\d+\s*unidades/i, /\bstock\b/i];

test.describe("inicio", () => {

  test("tiene un solo h1, el contenido en el HTML y el CTA de Instagram visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    for (const id of SECCIONES) await expect(page.locator(`#${id}`)).toBeAttached();
    const cta = page.getByRole("link", { name: /Síguenos en Instagram/ }).filter({ visible: true });
    await expect(cta.first()).toBeInViewport();
    await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
  });

  test("no usa lenguaje de tienda ni cifras de unidades", async ({ page }) => {
    await page.goto("/");
    const texto = await page.locator("body").innerText();
    for (const palabra of PROHIBIDAS) expect(texto).not.toMatch(palabra);
  });

  test("sin violaciones serias ni críticas de axe", async ({ page }) => {
    await page.goto("/");
    const { violations } = await new AxeBuilder({ page }).analyze();
    const graves = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves, JSON.stringify(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) })), null, 2)).toEqual([]);
  });

  test("capturas de cada sección", async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.screenshot({ path: `tests/e2e/capturas/${info.project.name}-completa.png`, fullPage: true });
  });
});

test("colaboraciones: accesible y sin laberinto", async ({ page }) => {
  await page.goto("/colaboraciones");
  await expect(page.locator("h1")).toHaveText("Hagamos algo juntos");
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});

test("vídeo de la historia: no descarga nada hasta pulsar y se abre y cierra en una ventana", async ({ page }) => {
  const mp4: string[] = [];
  page.on("request", (r) => r.url().includes(".mp4") && mp4.push(r.url()));
  await page.goto("/");
  const portada = page.getByRole("button", { name: /Mira la historia de CGA/ });
  await portada.scrollIntoViewIfNeeded();
  expect(mp4).toHaveLength(0);
  await portada.click();
  const dialogo = page.getByRole("dialog", { name: "Vídeo: la historia de CGA" });
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(portada).toBeFocused(); // el foco vuelve al botón
});
