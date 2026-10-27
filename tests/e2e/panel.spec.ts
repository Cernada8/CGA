import { createHmac } from "node:crypto";
import sharp from "sharp";
import { expect, type Page, test } from "@playwright/test";

// Panel de administración contra el Supabase real, con una cuenta de pruebas temporal.
// Solo corre si se pasan E2E_ADMIN_EMAIL / E2E_ADMIN_CLAVE (y E2E_INTRUSO_* para el usuario sin permiso).
const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "";
const CLAVE = process.env.E2E_ADMIN_CLAVE ?? "";
const INTRUSO = process.env.E2E_INTRUSO_EMAIL ?? "";
const CLAVE_INTRUSO = process.env.E2E_INTRUSO_CLAVE ?? "";
const NUEVA = "Tatami-Rueda-" + Date.now().toString().slice(-6) + "Xy";

test.describe.configure({ mode: "serial" });
test.skip(!EMAIL || !CLAVE, "Sin cuenta de pruebas del panel");
test.use({ storageState: { cookies: [], origins: [] } });

/** TOTP (RFC 6238) para simular Google Authenticator */
function totp(secreto: string, ahora = Date.now()) {
  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secreto.replace(/=+$/, "").toUpperCase()) bits += alfabeto.indexOf(c).toString(2).padStart(5, "0");
  const clave = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const contador = Buffer.alloc(8);
  contador.writeBigUInt64BE(BigInt(Math.floor(ahora / 30_000)));
  const h = createHmac("sha1", clave).update(contador).digest();
  const o = h[h.length - 1] & 0xf;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000)).padStart(6, "0");
}

let secreto = "";

async function entrar(page: Page, email: string, clave: string) {
  await page.goto("/admin/entrar");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(clave);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("sin sesión: todo el panel lleva a «Entrar» y las fotos privadas no se sirven", async ({ page, request }) => {
  for (const ruta of ["/admin", "/admin/prendas/nueva", "/admin/actividad", "/admin/cuenta", "/admin/codigo", "/admin/doble-factor"]) {
    await page.goto(ruta);
    await expect(page, ruta).toHaveURL(/\/admin\/entrar/);
  }
  const r = await request.get("/admin/fotos/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000.webp");
  expect(r.status()).toBe(401);
  const h = (await request.get("/admin/entrar")).headers();
  expect(h["cache-control"]).toContain("no-store");
  expect(h["x-robots-tag"]).toContain("noindex");
});

test("contraseña incorrecta y usuario sin permiso: mismo mensaje, sin pistas", async ({ page }) => {
  await entrar(page, EMAIL, "incorrecta-" + Date.now());
  await expect(page.getByRole("alert")).toHaveText("Correo o contraseña incorrectos.");
  if (INTRUSO) {
    await entrar(page, INTRUSO, CLAVE_INTRUSO);
    await expect(page.getByRole("alert")).toHaveText("Correo o contraseña incorrectos.");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/entrar/);
  }
});

test("primer acceso: contraseña nueva obligatoria y vincular el móvil", async ({ page, context }) => {
  await entrar(page, EMAIL, CLAVE);
  await expect(page).toHaveURL(/\/admin\/contrasena/);
  // Sin doble factor todavía no se puede entrar al panel
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/contrasena/);
  await page.getByLabel("Contraseña nueva").fill("corta");
  await page.getByLabel("Repite la contraseña").fill("corta");
  await page.getByRole("button", { name: "Guardar contraseña" }).click();
  await expect(page.getByRole("alert")).toContainText("no cumple");
  await page.getByLabel("Contraseña nueva").fill(NUEVA);
  await page.getByLabel("Repite la contraseña").fill(NUEVA);
  await page.getByRole("button", { name: "Guardar contraseña" }).click();

  await expect(page).toHaveURL(/\/admin\/doble-factor/);
  await expect(page.getByRole("img", { name: /Código QR/ })).toBeVisible();
  await page.getByRole("button", { name: /Escríbela a mano/ }).click();
  secreto = (await page.locator(".adm-secreto").innerText()).trim();
  await page.getByLabel("Código de 6 números").fill("000000");
  await page.getByRole("button", { name: "Vincular mi móvil" }).click();
  await expect(page.getByRole("alert")).toContainText("no vale");
  await page.getByLabel("Código de 6 números").fill(totp(secreto));
  await page.getByRole("button", { name: "Vincular mi móvil" }).click();
  await expect(page).toHaveURL(/\/admin\?bienvenida=1/);
  await expect(page.getByRole("heading", { name: "¿Qué quieres hacer hoy?" })).toBeVisible();

  // Las cookies de sesión: httpOnly, SameSite=Strict y solo para /admin
  const cookies = (await context.cookies()).filter((c) => c.name.startsWith("sb-"));
  expect(cookies.length).toBeGreaterThan(0);
  for (const c of cookies) {
    expect(c.httpOnly).toBe(true);
    expect(c.sameSite).toBe("Strict");
    expect(c.path).toBe("/admin");
  }
  expect(await page.evaluate(() => document.cookie)).not.toContain("sb-");
});

test("entrar con contraseña + código del móvil", async ({ page }) => {
  await entrar(page, EMAIL, NUEVA);
  await expect(page).toHaveURL(/\/admin\/codigo/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/codigo/); // sin código, no hay panel
  await page.getByLabel("Código de 6 números").fill(totp(secreto));
  await page.getByRole("button", { name: "Entrar al panel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("flujo completo: programar, subir foto oculta, lanzar, agotar y borrar", async ({ page, request }) => {
  test.setTimeout(120_000);
  await entrar(page, EMAIL, NUEVA);
  await page.getByLabel("Código de 6 números").fill(totp(secreto, Date.now() + 30_000));
  await page.getByRole("button", { name: "Entrar al panel" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  // 1) Programar un lanzamiento con cuenta atrás
  await page.getByRole("link", { name: /Programar un lanzamiento/ }).click();
  const nombreLanz = "E2E lanzamiento " + Date.now();
  await page.getByLabel("Nombre del lanzamiento").fill(nombreLanz);
  await page.getByLabel("Día").fill("2030-01-15");
  await page.getByLabel("Hora").fill("20:00");
  await page.getByRole("button", { name: "Crear lanzamiento" }).click();
  await expect(page).toHaveURL(/\/admin\/lanzamientos\/[0-9a-f-]{36}\?creado=1/);
  const lanzUrl = page.url().split("?")[0];

  // Color con poco contraste: rechazado
  await page.getByText("Otro", { exact: true }).click();
  await page.locator('input[name="acentoPropio"]').fill("#222222");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText(/se lee mal sobre negro/)).toBeVisible();
  await page.getByText("Caqui (el del gorila)").click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado. Ya está en la web.");

  // 2) Prenda para ese día
  await page.getByRole("link", { name: "+ Añadir una prenda a este lanzamiento" }).click();
  const nombrePrenda = "E2E sudadera " + Date.now();
  await page.getByLabel("Nombre de la prenda").fill(nombrePrenda);
  await page.getByLabel("Gramaje (opcional)").fill("350");
  await page.getByRole("button", { name: "Guardar y añadir fotos" }).click();
  await expect(page).toHaveURL(/\/admin\/prendas\/[0-9a-f-]{36}\?creada=1/);
  const prendaUrl = page.url().split("?")[0];

  // 3) Foto: un archivo que no es imagen se rechaza; una foto real se sube
  await page.getByLabel("Añadir una foto").setInputFiles({ name: "falsa.jpg", mimeType: "image/jpeg", buffer: Buffer.from("<script>alert(1)</script>") });
  await page.getByRole("button", { name: "Subir foto" }).click();
  await expect(page.getByRole("alert")).toContainText("no es una foto");
  const jpg = await sharp({ create: { width: 1200, height: 1500, channels: 3, background: "#777" } })
    .withMetadata({ exif: { IFD0: { Copyright: "GPS-SECRETO" } } })
    .jpeg()
    .toBuffer();
  await page.getByLabel("Añadir una foto").setInputFiles({ name: "sudadera.jpg", mimeType: "image/jpeg", buffer: jpg });
  await page.getByLabel("¿Qué se ve en la foto?").fill("Sudadera gris de prueba");
  await page.getByRole("button", { name: "Subir foto" }).click();
  await expect(page.getByRole("status")).toHaveText("Foto subida.");
  const miniatura = page.getByRole("img", { name: "Sudadera gris de prueba" });
  await expect(miniatura).toBeVisible();
  const src = (await miniatura.getAttribute("src"))!;
  const rutaPublica = src.replace("/admin/fotos/", "/fotos/");
  // Lo próximo: la foto NO se ve fuera del panel aunque se conozca la dirección
  expect((await request.get(rutaPublica)).status()).toBe(404);
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(nombrePrenda);

  // 4) Lanzarlo ya: pasa a «Lo nuevo» y la foto se sirve (WebP, sin metadatos)
  await page.goto(lanzUrl);
  await page.getByText("Lo nuevo", { exact: true }).click();
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toHaveText("Guardado. Ya está en la web.");
  const foto = await request.get(rutaPublica);
  expect(foto.status()).toBe(200);
  expect(foto.headers()["content-type"]).toBe("image/webp");
  const cuerpo = await foto.body();
  expect(cuerpo.includes(Buffer.from("GPS-SECRETO"))).toBe(false);
  await expect(async () => {
    await page.goto("/?entrar=directo");
    await expect(page.locator("#lo-nuevo").locator("xpath=ancestor::section")).toContainText(nombrePrenda, { timeout: 2000 });
  }).toPass({ timeout: 20_000 });

  // 5) Se agota: a «Ya no hay»
  await page.goto("/admin");
  await page.locator(".adm-prenda", { hasText: nombrePrenda }).getByRole("button", { name: "Se ha agotado" }).click();
  await expect(page.locator("section", { has: page.locator("#b-agotado") })).toContainText(nombrePrenda);

  // 6) Actividad: queda apuntado quién hizo qué
  await page.goto("/admin/actividad");
  await expect(page.locator(".adm-actividad")).toContainText(EMAIL);
  await expect(page.locator(".adm-actividad")).toContainText(nombrePrenda);

  // 7) Borrar prenda y lanzamiento; la foto deja de existir
  page.on("dialog", (d) => d.accept());
  await page.goto(prendaUrl);
  await page.getByText("Borrar esta prenda").click();
  await page.getByRole("button", { name: "Borrar para siempre" }).click();
  await expect(page).toHaveURL(/\/admin\?borrada=1/);
  expect((await request.get(rutaPublica)).status()).toBe(404);
  await page.goto(lanzUrl);
  await page.getByText("Borrar este lanzamiento").click();
  await page.getByLabel("Para confirmar, escribe BORRAR").fill("BORRAR");
  await page.getByRole("button", { name: "Borrar para siempre" }).click();
  await expect(page).toHaveURL(/\/admin\?borrado=1/);
  await expect(page.locator("body")).not.toContainText(nombreLanz);
});

test("inactividad: tras 30 minutos sin uso la sesión se cierra sola", async ({ page, context, baseURL }) => {
  await entrar(page, EMAIL, NUEVA);
  await page.getByLabel("Código de 6 números").fill(totp(secreto, Date.now() + 60_000));
  await page.getByRole("button", { name: "Entrar al panel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await context.addCookies([{ name: "cga_admin_actividad", value: String(Date.now() - 31 * 60_000), url: `${baseURL}/admin`, httpOnly: true, sameSite: "Strict" }]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/entrar\?motivo=inactividad/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/entrar/);
});
