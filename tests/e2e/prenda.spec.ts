import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const sinDesbordeHorizontal = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe("página de cada prenda", () => {
  test("desde «Lo nuevo» se entra a la prenda y se vuelve justo a su ficha", async ({ page }) => {
    // Navegar sin recargar no puede romper nada (Trusted Types, animaciones…)
    const avisos: string[] = [];
    page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && avisos.push(m.text()));
    page.on("pageerror", (e) => avisos.push(e.message));
    await page.goto("/");
    const enlace = page.locator("section[aria-labelledby='lo-nuevo']").getByRole("link", { name: "Camiseta oversize Discos" });
    await enlace.scrollIntoViewIfNeeded();
    // Toda la ficha es clicable: se pulsa en la foto, no en el texto
    await page.locator("#camiseta-oversize-discos img").click();
    await expect(page).toHaveURL(/\/prenda\/camiseta-oversize-discos$/);
    await expect(page.locator("h1")).toHaveText("Camiseta oversize Discos");
    await expect(page.locator("main img").first()).toBeVisible();
    await expect(page.getByText("220 g")).toBeVisible();
    const pedir = page.getByRole("link", { name: /Escríbenos por Instagram/ });
    await expect(pedir).toHaveAttribute("href", /ig\.me\/m\/cga\.training\.hard/);
    // En el móvil el botón está siempre a mano, sin hacer scroll
    if (test.info().project.name === "movil") await expect(pedir).toBeInViewport();
    await page.getByRole("link", { name: /Volver a «Lo nuevo»/ }).click();
    await expect(page).toHaveURL(/\/#camiseta-oversize-discos$/);
    await expect(page.locator("#camiseta-oversize-discos")).toBeInViewport();
    expect(avisos).toEqual([]);
  });

  test("una prenda agotada lo dice y no invita a pedirla", async ({ page }) => {
    await page.goto("/prenda/sudadera-rosa");
    await expect(page.locator("h1")).toHaveText("Sudadera rosa");
    await expect(page.getByText("Agotado. No vuelve.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Escríbenos por Instagram/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Volver a «Ya no hay»/ })).toBeVisible();
  });

  test("anterior y siguiente recorren su grupo", async ({ page }) => {
    await page.goto("/prenda/camiseta-oversize-gorila");
    const mas = page.getByRole("navigation", { name: /Más prendas/ });
    await expect(mas.getByRole("link", { name: /Anterior/ })).toHaveCount(0);
    await mas.getByRole("link", { name: /Siguiente/ }).click();
    await expect(page.locator("h1")).toHaveText("Camiseta oversize Discos");
  });

  test("con teclado: el nombre de la ficha es el enlace y se ve el foco", async ({ page }) => {
    await page.goto("/");
    const enlace = page.locator("#camiseta-oversize-gorila .ficha__enlace");
    await enlace.focus();
    const contorno = await page.locator("#camiseta-oversize-gorila .ficha").evaluate((e) => getComputedStyle(e).outlineStyle);
    expect(contorno).toBe("solid");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/prenda\/camiseta-oversize-gorila$/);
  });

  test("accesible, sin desborde lateral y con zonas táctiles de 44 px o más", async ({ page }) => {
    for (const ruta of ["/prenda/chaqueta-softshell", "/prenda/gorras"]) {
      await page.goto(ruta);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
      expect(await sinDesbordeHorizontal(page)).toBe(true);
      const pequenas = await page.locator("main a, main button").evaluateAll((els) =>
        els
          .map((e) => ({ texto: (e.textContent ?? "").trim().slice(0, 40), alto: e.getBoundingClientRect().height }))
          .filter((e) => e.alto > 0 && e.alto < 44),
      );
      expect(pequenas).toEqual([]);
    }
    await page.goto("/");
    expect(await sinDesbordeHorizontal(page)).toBe(true);
  });

  test("una prenda que no existe da 404", async ({ page }) => {
    const r = await page.goto("/prenda/no-existe");
    expect(r?.status()).toBe(404);
  });
});
