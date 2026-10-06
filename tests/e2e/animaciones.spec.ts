import { expect, test } from "@playwright/test";

const visibles = async (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("main h1, main h2, main h3, main p, main a, main button")].filter((e) => {
      const s = getComputedStyle(e);
      return s.visibility === "hidden" || Number(s.opacity) < 0.99;
    }).length,
  );

test.describe("animaciones", () => {
  test("con movimiento reducido todo el contenido está visible y no se oculta nada", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)anim(\s|$)/);
    await page.waitForTimeout(800);
    expect(await visibles(page)).toBe(0);
    await ctx.close();
  });

  test("la portada termina visible y sin estilos en línea", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-gsap", "listo");
    await expect(page.locator('[data-anim="palabra"]').first()).toBeInViewport();
    await page.waitForTimeout(2200);
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)anim(\s|$)/);
    expect(await page.locator('[data-anim="palabra"]').first().getAttribute("style")).toBeFalsy();
  });

  test("al recorrer la página entera no queda nada oculto ni hay saltos de diseño", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));
    const alto = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= alto; y += 400) {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1500);
    expect(await visibles(page)).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.1);
  });

  test("sin JavaScript se ve todo", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await visibles(page)).toBe(0);
    await expect(page.locator("h1")).toBeVisible();
    await ctx.close();
  });
});
