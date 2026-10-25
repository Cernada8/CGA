import { expect, test } from "@playwright/test";

// Escasez y urgencia: cuenta atrás de la próxima prenda (viernes 30 de octubre de 2026, 20:00 en Madrid),
// recordatorio en cabecera (escritorio) y barra fija (móvil). El reloj del navegador se fija para que sea determinista.

const SALIDA = new Date("2026-10-30T20:00:00+01:00").getTime();
const HORA = 3_600_000;

/** Reloj del navegador parado en un instante exacto (luego se avanza a mano con clock.runFor). */
async function fijarReloj(page: import("@playwright/test").Page, instante: number) {
  await page.clock.install({ time: instante - 1000 });
  await page.clock.pauseAt(instante);
}

test.describe("cuenta atrás de la próxima prenda", () => {
  test("a 5 días: fecha clara, cifras vivas y prenda tapada", async ({ page }) => {
    await fijarReloj(page, SALIDA - 5 * 24 * HORA + 30_000);
    await page.goto("/");
    const seccion = page.locator("section", { has: page.locator("#lo-proximo") });
    await expect(seccion.getByText("Sale el viernes.")).toBeVisible();
    await expect(seccion.getByText("30 de octubre, a las 20:00")).toBeVisible();
    await expect(seccion.locator(".reloj__unidad").first()).toContainText("04");
    await expect(seccion.locator(".reloj__unidad").first()).toContainText("días");
    await expect(seccion.locator(".reloj__aviso")).toHaveCount(0);
    await expect(seccion.getByRole("img", { name: /Prenda tapada.*30 de octubre/ })).toBeVisible();
    // Lectores de pantalla: la fecha completa, no un número que cambia cada segundo
    await expect(seccion.locator("time")).toHaveAttribute("datetime", "2026-10-30T20:00:00+01:00");
  });

  test("el reloj avanza cada segundo", async ({ page }) => {
    await fijarReloj(page, SALIDA - 2 * 24 * HORA - 10_000);
    await page.goto("/");
    const segundos = page.locator(".reloj__unidad").nth(3).locator(".reloj__numero");
    await expect(segundos).toHaveText("10");
    await page.clock.runFor(3000);
    await expect(segundos).toHaveText("07");
  });

  test("últimas 24 horas: aviso de urgencia y números en el acento", async ({ page }) => {
    await fijarReloj(page, SALIDA - 10 * HORA);
    await page.goto("/");
    await expect(page.locator(".reloj__aviso")).toHaveText("Últimas horas");
    await expect(page.locator(".reloj")).toHaveAttribute("data-fase", "horas");
  });

  test("última hora", async ({ page }) => {
    await fijarReloj(page, SALIDA - 20 * 60_000);
    await page.goto("/");
    await expect(page.locator(".reloj__aviso")).toHaveText("Última hora");
  });

  test("al llegar a cero: «Ya ha salido» y enlace al DM", async ({ page }) => {
    await fijarReloj(page, SALIDA + 60_000);
    await page.goto("/");
    await expect(page.getByText("Ya ha salido.")).toBeVisible();
    await expect(page.locator(".reloj--fuera").getByRole("link", { name: /Escríbenos por Instagram/ })).toHaveAttribute("href", /ig\.me/);
  });
});

test.describe("recordatorio siempre a mano", () => {
  test("escritorio: píldora en la cabecera que lleva a «Lo próximo»", async ({ page }, info) => {
    test.skip(info.project.name !== "escritorio");
    await fijarReloj(page, SALIDA - 3 * 24 * HORA);
    await page.goto("/");
    const chip = page.locator("header .aviso-drop--cabecera");
    await expect(chip).toBeVisible();
    await expect(chip).toContainText("La próxima sale en");
    await expect(chip).toContainText("3 d 00 h 00 min");
    await expect(page.locator(".aviso-drop--barra")).toBeHidden();
  });

  test("móvil: barra fija que no tapa la portada ni repite «Lo próximo»", async ({ page }, info) => {
    test.skip(info.project.name !== "movil");
    await fijarReloj(page, SALIDA - 3 * 24 * HORA);
    await page.goto("/");
    const barra = page.locator(".aviso-drop--barra");
    await expect(page.locator("header .aviso-drop--cabecera")).toBeHidden();
    await expect(barra).toHaveAttribute("data-oculta", "true");
    await page.evaluate(() => document.getElementById("lo-nuevo")!.scrollIntoView());
    await expect(barra).not.toHaveAttribute("data-oculta", /.*/);
    await expect(barra).toBeInViewport();
    await page.evaluate(() => document.getElementById("lo-proximo")!.scrollIntoView());
    await expect(barra).toHaveAttribute("data-oculta", "true");
    // El pie deja hueco abajo para que la barra nunca tape su último texto
    const relleno = await page.locator("main + footer").evaluate((f) => parseFloat(getComputedStyle(f).paddingBottom));
    expect(relleno).toBeGreaterThanOrEqual(80);
  });
});
