import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Perchero de equipaciones en /colaboraciones: prendas colgadas y vista ampliada.
// Con movimiento reducido las prendas no se balancean y Playwright puede pulsarlas sin esperar a que «paren».
test.use({ reducedMotion: "reduce" });

test.describe("perchero de equipaciones", () => {
  test("se abre una prenda, se ve por detrás, se cierra con Esc y el foco vuelve a su percha", async ({ page }) => {
    const avisos: string[] = [];
    page.on("pageerror", (e) => avisos.push(e.message));
    page.on("console", (m) => m.type() === "error" && avisos.push(m.text()));
    await page.goto("/colaboraciones");
    const prendas = page.locator(".colgada__boton");
    await expect(prendas).toHaveCount(10);
    await page.locator(".colgada__zona").first().click();
    await expect(page).toHaveURL(/\?prenda=s23-machine-camiseta$/);
    const vista = page.getByRole("dialog");
    await expect(vista).toBeVisible();
    await expect(vista.getByRole("img", { name: /por delante/ })).toBeVisible();
    await vista.getByRole("button", { name: "Detrás" }).click();
    await expect(vista.getByRole("button", { name: "Detrás" })).toHaveAttribute("aria-pressed", "true");
    await expect(vista.getByRole("img", { name: /por detrás/ })).toBeVisible();
    await expect(vista.getByRole("link", { name: /Escríbenos por Instagram/ })).toHaveAttribute("href", /ig\.me/);
    const { violations } = await new AxeBuilder({ page }).include(".vista").analyze();
    expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(vista).toBeHidden();
    await expect(page).toHaveURL(/\/colaboraciones$/);
    await expect(prendas.first()).toBeFocused();
    expect(avisos).toEqual([]);
  });

  test("cada equipación cuelga junta y desde una pieza se salta a la otra sin cerrar", async ({ page }) => {
    await page.goto("/colaboraciones");
    // Camiseta y short seguidos; la etiqueta del conjunto solo en la primera pieza
    const slugs = await page.locator(".colgada").evaluateAll((l) => l.map((e) => (e as HTMLElement).dataset.slug));
    expect(slugs.indexOf("infames-negro-short")).toBe(slugs.indexOf("infames-negro-camiseta") + 1);
    await expect(page.locator(".colgada__etiqueta")).toHaveCount(5);
    await page.goto("/colaboraciones?prenda=fight-club-aranda-camiseta");
    const vista = page.getByRole("dialog");
    await expect(vista.getByRole("heading", { name: "Rashguard Fight Club Aranda" })).toBeVisible();
    await vista.getByRole("button", { name: "Short Fight Club Aranda" }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Short Fight Club Aranda" })).toBeVisible();
    await expect(page).toHaveURL(/\?prenda=fight-club-aranda-short$/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(/\/colaboraciones$/);
  });

  test("un enlace con ?prenda= abre esa prenda directamente", async ({ page }) => {
    await page.goto("/colaboraciones?prenda=s23-machine-short");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByRole("img", { name: /Pantalón corto/ })).toBeVisible();
    await page.getByRole("button", { name: "Cerrar" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(/\/colaboraciones$/);
  });

  test("teclado: un solo tabulador para la barra, flechas para moverse y Enter para abrir", async ({ page }) => {
    await page.goto("/colaboraciones");
    const prendas = page.locator(".colgada__boton");
    await prendas.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(prendas.nth(1)).toBeFocused();
    await expect(prendas.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(prendas.first()).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\?prenda=s23-machine-short$/);
  });

  test("accesible, sin desborde lateral y sin balanceo con movimiento reducido", async ({ page }) => {
    await page.goto("/colaboraciones");
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // Lista para publicar: ni marcadores de datos pendientes ni etiquetas de prueba
    await expect(page.locator(".pendiente")).toHaveCount(0);
    for (const nombre of await page.locator(".colgada__boton").evaluateAll((b) => b.map((e) => e.getAttribute("aria-label") ?? ""))) {
      expect(nombre).not.toMatch(/sin nombre/i);
    }
    const animacion = await page.locator(".colgada__balanceo").first().evaluate((e) => getComputedStyle(e).animationName);
    expect(animacion).toBe("none");
    // Ninguna prenda cortada: el bajo de cada imagen visible queda dentro del perchero
    const cortadas = await page.evaluate(() => {
      const fila = document.querySelector(".perchero__fila")!.getBoundingClientRect();
      return [...document.querySelectorAll(".colgada__zona")].filter((z) => z.getBoundingClientRect().bottom > fila.bottom + 1).length;
    });
    expect(cortadas).toBe(0);
  });
});
