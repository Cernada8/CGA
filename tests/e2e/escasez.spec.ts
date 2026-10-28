import { expect, test } from "@playwright/test";

// Ahora mismo no hay ninguna prenda anunciada: no puede quedar ni rastro de la cuenta atrás.
// Cuando se anuncie la siguiente (estado "proximo" con fecha), vuelven la sección «Lo próximo»,
// la píldora de la cabecera y la barra del móvil; entonces hay que recuperar aquí sus pruebas
// (están en el historial del repositorio).

test("sin próxima prenda anunciada no hay cuenta atrás ni avisos", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#lo-proximo")).toHaveCount(0);
  await expect(page.locator(".reloj")).toHaveCount(0);
  await expect(page.locator(".cinta-lema")).toHaveCount(0);
  await expect(page.getByText(/La próxima sale/)).toHaveCount(0);
  await expect(page.locator("a[href='#lo-proximo']")).toHaveCount(0);
});
