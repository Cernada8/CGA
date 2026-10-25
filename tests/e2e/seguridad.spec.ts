import { expect, test } from "@playwright/test";

// Pruebas de seguridad: cabeceras, CSP sin violaciones, rutas que no deben existir,
// ficheros que nunca deben servirse y abusos típicos de URL.

const PAGINAS = ["/", "/colaboraciones", "/no-existe-esta-ruta"];

const CABECERAS_OBLIGATORIAS: Record<string, RegExp> = {
  "content-security-policy": /default-src 'self'/,
  "strict-transport-security": /max-age=\d{8,}/,
  "x-content-type-options": /^nosniff$/,
  "x-frame-options": /^DENY$/,
  "referrer-policy": /^strict-origin-when-cross-origin$/,
  "permissions-policy": /^(?=.*camera=\(\))(?=.*microphone=\(\))(?=.*geolocation=\(\))(?=.*payment=\(\))/,
  "cross-origin-opener-policy": /^same-origin$/,
  "cross-origin-resource-policy": /^same-origin$/,
};

test.describe("cabeceras de seguridad", () => {
  for (const ruta of PAGINAS) {
    test(`todas presentes en ${ruta}`, async ({ request }) => {
      const r = await request.get(ruta);
      const h = r.headers();
      for (const [nombre, patron] of Object.entries(CABECERAS_OBLIGATORIAS)) {
        expect(h[nombre], `falta o es incorrecta: ${nombre}`).toMatch(patron);
      }
      expect(h["x-powered-by"], "no se debe anunciar la tecnología").toBeUndefined();
    });
  }

  test("la CSP cierra lo peligroso", async ({ request }) => {
    const csp = (await request.get("/")).headers()["content-security-policy"];
    for (const d of [
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "upgrade-insecure-requests",
    ]) {
      expect(csp).toContain(d);
    }
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/https?:\/\/|\*/); // ningún origen externo ni comodines
  });

  test("también en estáticos (imágenes, vídeo, JS)", async ({ request, page }) => {
    await page.goto("/");
    const js = await page.locator("script[src^='/_next/']").first().getAttribute("src");
    for (const ruta of [js!, "/hero/cga-luchador.webp", "/marca/cga-insignia.svg"]) {
      const r = await request.get(ruta);
      if (r.status() === 404) continue; // si el nombre del logo cambia, no rompe la prueba
      expect(r.headers()["x-content-type-options"]).toBe("nosniff");
      expect(r.headers()["cross-origin-resource-policy"]).toBe("same-origin");
    }
  });
});

test.describe("CSP en el navegador", () => {
  test("cero violaciones al cargar, hacer scroll y abrir el vídeo", async ({ page }) => {
    const violaciones: string[] = [];
    let enPagina404 = false;
    page.on("console", (m) => {
      const t = m.text();
      if (enPagina404 && /status of 404/.test(t)) return; // la propia página 404 responde 404
      if (/Content Security Policy|Refused to|Permissions-Policy|Unrecognized feature/i.test(t)) violaciones.push(t);
      else if (m.type() === "error") violaciones.push(`error de consola: ${t}`);
    });
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => {
        console.error(`Refused to (CSP): ${e.violatedDirective} ${e.blockedURI}`);
      });
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    const abrirVideo = page.getByRole("button", { name: /ver (el )?v[ií]deo/i }).first();
    if (await abrirVideo.count()) {
      await abrirVideo.click();
      await page.waitForTimeout(800);
    }
    await page.goto("/colaboraciones", { waitUntil: "networkidle" });
    enPagina404 = true;
    await page.goto("/no-existe", { waitUntil: "networkidle" });
    expect(violaciones).toEqual([]);
  });

  test("todas las peticiones van al propio dominio (sin terceros ni contenido mixto)", async ({ page, baseURL }) => {
    const origen = new URL(baseURL!).origin;
    const fuera: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      if (!u.startsWith(origen) && !u.startsWith("data:") && !u.startsWith("blob:")) fuera.push(u);
    });
    await page.goto("/", { waitUntil: "networkidle" });
    expect(fuera).toEqual([]);
  });

  test("no se puede incrustar la web en un iframe (clickjacking)", async ({ page, baseURL }) => {
    let bloqueado = false;
    page.on("console", (m) => {
      if (/frame-ancestors|X-Frame-Options|refused to (display|frame)/i.test(m.text())) bloqueado = true;
    });
    await page.goto("about:blank");
    await page.setContent(`<iframe src="${baseURL}/" width="400" height="300"></iframe>`);
    await page.waitForTimeout(1500);
    const marco = page.frames().find((f) => f.url().startsWith(baseURL!));
    const contenido = marco ? await marco.locator("main").count().catch(() => 0) : 0;
    expect(bloqueado || contenido === 0).toBe(true);
  });

  test("los enlaces externos abren aislados (noopener noreferrer)", async ({ page }) => {
    for (const ruta of ["/", "/colaboraciones", "/no-existe"]) {
      await page.goto(ruta);
      const enlaces = page.locator('a[target="_blank"]');
      const n = await enlaces.count();
      for (let i = 0; i < n; i++) {
        const rel = (await enlaces.nth(i).getAttribute("rel")) ?? "";
        expect(rel, await enlaces.nth(i).getAttribute("href") ?? "").toMatch(/noopener/);
        expect(rel).toMatch(/noreferrer/);
      }
    }
  });
});

test.describe("superficie expuesta", () => {
  test("las rutas de pruebas no existen en producción", async ({ request }) => {
    for (const ruta of ["/dev/revelado", "/dev/error"]) {
      expect((await request.get(ruta)).status(), ruta).toBe(404);
    }
  });

  test("ficheros sensibles nunca se sirven", async ({ request }) => {
    for (const ruta of [
      "/.env",
      "/.env.local",
      "/.git/config",
      "/package.json",
      "/next.config.ts",
      "/CLAUDE.md",
      "/.next/BUILD_ID",
      "/_next/../package.json",
      "/%2e%2e/package.json",
      "/_next/static/%2e%2e/%2e%2e/package.json",
      "/public/../package.json",
      "/..%2fpackage.json",
    ]) {
      const r = await request.get(ruta, { maxRedirects: 0 });
      const cuerpo = await r.text();
      expect(cuerpo, ruta).not.toContain('"dependencies"');
      expect(cuerpo, ruta).not.toMatch(/SUPABASE|SECRET|repositoryformatversion/i);
      expect([400, 404, 308]).toContain(r.status());
    }
  });

  test("no se publican source maps", async ({ request, page }) => {
    await page.goto("/");
    const scripts = await page.locator("script[src^='/_next/']").evaluateAll((s) =>
      s.map((e) => e.getAttribute("src")!),
    );
    expect(scripts.length).toBeGreaterThan(0);
    for (const src of scripts.slice(0, 5)) {
      const js = await (await request.get(src)).text();
      expect(js, src).not.toContain("sourceMappingURL");
      expect((await request.get(`${src}.map`)).status(), `${src}.map`).toBe(404);
    }
  });

  test("el optimizador de imágenes no acepta URLs externas", async ({ request }) => {
    const r = await request.get("/_next/image?url=https%3A%2F%2Fexample.com%2Fa.png&w=640&q=75");
    expect(r.status()).toBe(400);
    const local = await request.get("/_next/image?url=%2Fhero%2Fcga-luchador.webp&w=640&q=75");
    expect(local.status()).toBe(200);
  });

  test("métodos de escritura rechazados en páginas", async ({ request }) => {
    for (const metodo of ["POST", "PUT", "DELETE", "PATCH"] as const) {
      const r = await request.fetch("/", { method: metodo, data: "x=1" });
      expect(r.status(), metodo).toBeGreaterThanOrEqual(400);
      expect(r.status(), metodo).toBeLessThan(500);
    }
  });

  test("parámetros maliciosos no se reflejan en la página", async ({ page }) => {
    const carga = `"><img src=x onerror=alert(1)><script>alert(1)</script>`;
    let dialogo = false;
    page.on("dialog", async (d) => {
      dialogo = true;
      await d.dismiss();
    });
    await page.goto(`/?q=${encodeURIComponent(carga)}#${encodeURIComponent(carga)}`);
    await page.goto(`/${encodeURIComponent(carga)}`);
    const html = await page.content();
    expect(html).not.toContain("onerror=alert(1)");
    expect(dialogo).toBe(false);
  });

  test("robots.txt bloquea /dev y security.txt existe", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/dev\//);
    const sec = await request.get("/.well-known/security.txt");
    expect(sec.status()).toBe(200);
    const texto = await sec.text();
    expect(texto).toMatch(/^Contact: mailto:/m);
    const expira = new Date(texto.match(/^Expires: (.+)$/m)![1]);
    expect(expira.getTime()).toBeGreaterThan(Date.now());
  });
});
