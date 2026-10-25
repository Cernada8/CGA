import AxeBuilder from "@axe-core/playwright";
import { type Browser, expect, type Page, test } from "@playwright/test";
import { correr, direccionEntre, type Direccion, generar, resolver } from "../../lib/laberinto";

// Puerta de entrada: solo entra quien supera Constancia (laberinto), Ganas (aguantar) y Actitud (lema).
// Cada prueba usa un contexto limpio, sin la marca de «superado» que llevan el resto de specs.

const CAPTURAS = process.env.CAPTURAS === "1";
const TECLA: Record<Direccion, string> = { arriba: "ArrowUp", abajo: "ArrowDown", izquierda: "ArrowLeft", derecha: "ArrowRight" };

// Sin la marca de «superado» que llevan el resto de specs (ver playwright.config.ts)
test.use({ storageState: { cookies: [], origins: [] } });

async function nueva(browser: Browser, opciones: Parameters<Browser["newContext"]>[0] = {}) {
  const ctx = await browser.newContext(opciones);
  return { ctx, page: await ctx.newPage() };
}

async function captura(page: Page, nombre: string) {
  if (CAPTURAS) await page.screenshot({ path: `tests/e2e/capturas/puerta-${nombre}-${test.info().project.name}.png` });
}

/** Resuelve el laberinto con el teclado leyendo la semilla del DOM y la misma lógica pura del componente. */
async function resolverLaberinto(page: Page, { equivocarse = false } = {}) {
  const tablero = page.locator(".laberinto");
  await expect(tablero).toHaveAttribute("data-semilla", /\d+/);
  const lab = generar(
    Number(await tablero.getAttribute("data-columnas")),
    Number(await tablero.getAttribute("data-filas")),
    Number(await tablero.getAttribute("data-semilla")),
  );
  let pos = lab.inicio;
  const quieto = () => expect(tablero).toHaveAttribute("data-movimiento", "quieto");
  if (equivocarse) {
    // Una pared: no se mueve y avisa
    await page.keyboard.press("ArrowUp");
    await quieto();
    await expect(tablero).toHaveAttribute("data-y", "0");
  }
  for (let guarda = 0; guarda < 200; guarda++) {
    const camino = resolver(lab, pos);
    if (camino.length < 2) break;
    const d = direccionEntre(camino[0], camino[1]);
    const tramo = correr(lab, pos, d);
    pos = tramo[tramo.length - 1];
    await page.keyboard.press(TECLA[d]);
    // Al llegar a la salida la prueba se cierra (al instante con movimiento reducido)
    if (pos.x === lab.salida.x && pos.y === lab.salida.y) break;
    await expect(tablero).toHaveAttribute("data-x", String(pos.x));
    await expect(tablero).toHaveAttribute("data-y", String(pos.y));
    await quieto();
  }
}

async function superarGanas(page: Page) {
  const boton = page.locator(".agarre__boton");
  await expect(boton).toBeVisible();
  await captura(page, "2-ganas");
  await boton.focus();
  await page.keyboard.down(" ");
  await page.waitForTimeout(2600);
  await page.keyboard.up(" ");
}

async function superarLema(page: Page, { fallar = false } = {}) {
  await expect(page.getByRole("heading", { name: "Actitud", exact: true })).toBeFocused();
  await captura(page, "3-lema");
  if (fallar) {
    await page.getByRole("button", { name: "rendidos" }).click();
    await expect(page.locator(".lema__pista")).toHaveText(/No es eso/);
  }
  await page.getByRole("button", { name: "sumisos" }).click();
}

test.describe("puerta de entrada", () => {
  test("primera visita: la puerta tapa la web y el resto es inert", async ({ browser }) => {
    const { ctx, page } = await nueva(browser);
    await page.goto("/");
    const puerta = page.getByRole("dialog", { name: "No entra cualquiera." });
    await expect(puerta).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/(^|\s)con-puerta(\s|$)/);
    await expect(page.getByRole("button", { name: "Empezar" })).toBeFocused();
    expect(await page.locator("body > main").evaluate((m) => (m as HTMLElement).inert)).toBe(true);
    // No hay botón para saltarla
    await expect(page.getByRole("button", { name: /entrar directo|saltar/i })).toHaveCount(0);
    // El contenido sigue en el HTML para buscadores
    await expect(page.locator("main h1")).toHaveCount(1);
    await captura(page, "0-intro");
    const axe = await new AxeBuilder({ page }).include("#puerta").analyze();
    expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    await ctx.close();
  });

  test("las tres pruebas completas abren la web, revelan C-G-A y no vuelve a salir", async ({ browser }) => {
    test.setTimeout(90_000);
    const { ctx, page } = await nueva(browser);
    const errores: string[] = [];
    page.on("pageerror", (e) => errores.push(e.message));
    await page.goto("/");
    await page.getByRole("button", { name: "Empezar" }).click();

    await expect(page.getByRole("heading", { name: "Constancia", exact: true })).toBeVisible();
    await captura(page, "1-laberinto");
    await resolverLaberinto(page, { equivocarse: true });
    await expect(page.locator('[data-letra="0"]')).toHaveAttribute("data-estado", "superada");

    await superarGanas(page);
    await expect(page.locator('[data-letra="1"]')).toHaveAttribute("data-estado", "superada");

    await superarLema(page, { fallar: true });
    await expect(page.locator('[data-letra="2"]')).toHaveAttribute("data-estado", "superada");

    // Revelado C-G-A y apertura
    await expect(page.getByRole("status", { name: "Constancia, Ganas y Actitud" })).toBeAttached();
    await page.waitForTimeout(900);
    await captura(page, "4-revelado");
    await expect(page.locator("#puerta")).toBeHidden({ timeout: 6000 });
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)con-puerta(\s|$)/);
    expect(await page.locator("body > main").evaluate((m) => (m as HTMLElement).inert)).toBe(false);
    await expect(page.locator("#manifiesto-titulo")).toBeVisible();
    await page.waitForTimeout(1800);
    await captura(page, "5-dentro");
    // La portada termina su entrada sin estilos colgando
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)anim(\s|$)/);
    expect(await page.evaluate(() => localStorage.getItem("cga:laberinto:superado"))).toBe("1");

    await page.reload();
    await expect(page.locator("#puerta")).toBeHidden();
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)con-puerta(\s|$)/);
    expect(errores).toEqual([]);
    await ctx.close();
  });

  test("?entrar=directo abre la puerta, la recuerda y limpia la URL", async ({ browser }) => {
    const { ctx, page } = await nueva(browser);
    await page.goto("/?entrar=directo#lo-nuevo");
    await expect(page.locator("#puerta")).toBeHidden();
    expect(new URL(page.url()).search).toBe("");
    expect(new URL(page.url()).hash).toBe("#lo-nuevo");
    await page.goto("/");
    await expect(page.locator("#puerta")).toBeHidden();
    await ctx.close();
  });

  test("/colaboraciones nunca muestra la puerta", async ({ browser }) => {
    const { ctx, page } = await nueva(browser);
    await page.goto("/colaboraciones");
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)con-puerta(\s|$)/);
    await expect(page.locator("#puerta")).toHaveCount(0);
    await ctx.close();
  });

  test("sin JavaScript no hay puerta y se ve toda la web", async ({ browser }) => {
    const { ctx, page } = await nueva(browser, { javaScriptEnabled: false });
    await page.goto("/");
    await expect(page.locator("#puerta")).toBeHidden();
    await expect(page.locator("main h1")).toBeVisible();
    await ctx.close();
  });

  test("con movimiento reducido también se puede entrar, sin animaciones", async ({ browser }) => {
    test.setTimeout(60_000);
    const { ctx, page } = await nueva(browser, { reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Empezar" }).click();
    await resolverLaberinto(page);
    await superarGanas(page);
    await superarLema(page);
    await expect(page.locator("#puerta")).toBeHidden({ timeout: 6000 });
    await expect(page.locator("main h1")).toBeVisible();
    await ctx.close();
  });

  test("Ganas también se supera a toques (sin mantener pulsado)", async ({ browser }) => {
    const { ctx, page } = await nueva(browser);
    await page.goto("/");
    await page.getByRole("button", { name: "Empezar" }).click();
    await resolverLaberinto(page);
    const boton = page.locator(".agarre__boton");
    await expect(boton).toBeVisible();
    const caja = (await boton.boundingBox())!;
    // Toques rápidos de una persona: ~8 por segundo
    for (let i = 0; i < 30; i++) {
      await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
      await page.waitForTimeout(120);
    }
    await expect(page.getByRole("heading", { name: "Actitud", exact: true })).toBeVisible();
    await ctx.close();
  });
});
