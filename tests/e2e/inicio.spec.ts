import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SECCIONES = ["lo-nuevo", "colaboraciones", "ya-no-hay", "historia", "embajadores", "como-conseguirlo"];
const PROHIBIDAS = [/drop \d/i, /\[NÚMERO\]/, /carrito/i, /comprar/i, /oferta/i, /descuento/i, /rebajas/i, /\d+\s*unidades/i, /\bstock\b/i, /últimas unidades/i, /reposición disponible/i, /vuelve pronto/i];

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

test("historia: vuelve solo el vídeo, sin el texto largo retirado", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#historia")).toHaveText("De dónde venimos");
  await expect(page.getByText(/Un chico/)).toHaveCount(0);
});

test("vídeo de la historia: no descarga nada hasta pulsar y se abre y cierra en una ventana", async ({ page }) => {
  const video: string[] = [];
  page.on("request", (r) => /\.(mp4|webm)(\?|$)/.test(r.url()) && video.push(r.url()));
  await page.goto("/");
  const portada = page.getByRole("button", { name: /Mira la historia de CGA/ });
  await portada.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(video).toHaveLength(0);
  await portada.click();
  const dialogo = page.getByRole("dialog", { name: "Vídeo: la historia de CGA" });
  await expect(dialogo).toBeVisible();
  // WebM primero (pesa menos); el MP4 queda de respaldo
  await expect(dialogo.locator("source").first()).toHaveAttribute("src", "/video/historia-cga.webm");
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(portada).toBeFocused(); // el foco vuelve al botón
});

test("catálogo real: fotos en todas las fichas, sin huecos ni marcadores", async ({ page }) => {
  await page.goto("/");
  const nuevo = page.locator("section[aria-labelledby='lo-nuevo'] .ficha");
  const agotado = page.locator("section[aria-labelledby='ya-no-hay'] .ficha");
  await expect(nuevo).toHaveCount(13);
  await expect(agotado).toHaveCount(16);
  await expect(page.locator(".foto-pendiente")).toHaveCount(0);
  await expect(page.locator(".pendiente")).toHaveCount(0);
  await expect(page.locator(".embajador")).toHaveCount(4);
  await expect(page.locator("section[aria-labelledby='colaboraciones'] .colgada")).toHaveCount(10);
  // Todas las fotos cargan de verdad (ninguna rota)
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  const rotas = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>("#contenido img")].filter((i) => getComputedStyle(i).display !== "none");
    // Las diferidas que no han entrado en pantalla (p. ej. la tira horizontal en móvil) no cuentan
    const espera = (i: HTMLImageElement) =>
      Promise.race([new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }), new Promise((r) => setTimeout(r, 3000))]);
    await Promise.all(imgs.map((i) => (i.complete ? null : espera(i))));
    return imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
  });
  expect(rotas).toEqual([]);
  // Ningún rótulo de terceros en los textos alternativos
  const alts = await page.locator("#contenido img").evaluateAll((l) => l.map((i) => i.getAttribute("alt") ?? ""));
  for (const a of alts) expect(a).not.toMatch(/patch\s*4\s*gi|soto|infames|arganda|aranda/i);
});

test("404: página propia con código 404 y salida al inicio", async ({ page }) => {
  const r = await page.goto("/esto-no-existe");
  expect(r?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("No hay nada");
  await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeVisible();
});

test("las prendas salen ordenadas por familias, con atajos a cada una", async ({ page }) => {
  await page.goto("/");
  const nuevo = page.locator("section[aria-labelledby='lo-nuevo']");
  await expect(nuevo.locator(".grupo-prendas__titulo")).toHaveText(["Camisetas y tirantes", "Sudaderas y chaquetas", "Mallas, shorts y tops"]);
  const agotado = page.locator("section[aria-labelledby='ya-no-hay']");
  await expect(agotado.locator(".grupo-prendas__titulo")).toHaveText(["Camisetas y tirantes", "Sudaderas y chaquetas", "Gorras y gorros"]);
  // Dentro de cada familia no se mezclan: todas las sudaderas juntas
  const nombres = await agotado.locator("#ya-no-hay-sudaderas ~ ul .ficha__nombre").allTextContents();
  expect(nombres.every((n) => /Sudadera|Chaqueta/.test(n))).toBe(true);
  await nuevo.getByRole("link", { name: "Sudaderas y chaquetas" }).click();
  await expect(page.locator("#lo-nuevo-sudaderas")).toBeInViewport();
});

test("portada: el perchero de colaboraciones abre las equipaciones sin tocar la URL", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const seccion = page.locator("section[aria-labelledby='colaboraciones']");
  await seccion.locator(".colgada__zona").first().scrollIntoViewIfNeeded();
  await seccion.locator(".colgada__zona").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  // Sin huecos: lo primero que cuelga (la etiqueta o la ropa) empieza alineado con el texto de la sección
  const desfase = await page.evaluate(() => {
    const titulo = document.querySelector("#colaboraciones")!.getBoundingClientRect().left;
    const primera = document.querySelector("section[aria-labelledby='colaboraciones'] .colgada")!;
    const izquierdas = [...primera.querySelectorAll(".colgada__zona, .colgada__carton")].map((e) => e.getBoundingClientRect().left);
    return Math.abs(Math.min(...izquierdas) - titulo);
  });
  expect(desfase).toBeLessThan(40);
});

test("menú de secciones: en el móvil se abre, lleva a la sección y se cierra; en escritorio los atajos van en la cabecera", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "movil") {
    await page.getByRole("button", { name: "Menú" }).click();
    const menu = page.getByRole("dialog", { name: "Menú" });
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Colaboraciones" }).click();
    await expect(menu).toBeHidden();
  } else {
    await expect(page.getByRole("button", { name: "Menú" })).toBeHidden();
    await page.getByRole("banner").getByRole("link", { name: "Colaboraciones" }).click();
  }
  await expect(page.locator("#colaboraciones")).toBeInViewport();
});
