// Genera las tarjetas para compartir (Open Graph, X, WhatsApp, Instagram…) a 1200 × 630 en JPG.
// Abre las plantillas de /dev/tarjeta con Playwright (mismas fuentes y estilos que la web) y las guarda:
//   app/opengraph-image.jpg y app/twitter-image.jpg                 → portada (y por defecto)
//   app/colaboraciones/opengraph-image.jpg y twitter-image.jpg      → /colaboraciones
//   public/og/prenda/<slug>.jpg + lib/tarjetas.json                 → una por prenda del catálogo
//
// Uso (con la web arrancada y las rutas /dev activas):
//   npm run build && CGA_RUTAS_DEV=1 npx next start -p 3100
//   npm run tarjetas -- http://localhost:3100
// Vuelve a ejecutarlo cuando cambies prendas, nombres o el logo.
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const ALT_INICIO = "CGA Training Hard: el logotipo sobre el polvo de tatami. Constancia, Ganas y Actitud.";
const ALT_COLAB = "CGA Training Hard, colaboraciones: hagamos algo juntos. Equipaciones para academias, equipos y marcas.";

const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const slugs = [...sitemap.matchAll(/\/prenda\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]);

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

async function capturar(ruta, destino) {
  const r = await pagina.goto(`${base}/dev/tarjeta/${ruta}`);
  if (!r?.ok()) throw new Error(`${ruta}: ${r?.status()} (¿arrancada con CGA_RUTAS_DEV=1?)`);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForFunction(() => [...document.images].every((i) => i.complete));
  const png = await pagina.locator("#tarjeta").screenshot({ type: "png" });
  // JPG progresivo con mozjpeg: nítido y ligero (WhatsApp ignora imágenes de más de ~300 KB)
  const jpg = await sharp(png).jpeg({ quality: 86, mozjpeg: true, progressive: true }).toBuffer();
  await writeFile(destino, jpg);
  console.log(`${destino} (${Math.round(jpg.length / 1024)} KB)`);
}

await capturar("inicio", "app/opengraph-image.jpg");
await capturar("inicio", "app/twitter-image.jpg");
await writeFile("app/opengraph-image.alt.txt", ALT_INICIO);
await writeFile("app/twitter-image.alt.txt", ALT_INICIO);

await capturar("colaboraciones", "app/colaboraciones/opengraph-image.jpg");
await capturar("colaboraciones", "app/colaboraciones/twitter-image.jpg");
await writeFile("app/colaboraciones/opengraph-image.alt.txt", ALT_COLAB);
await writeFile("app/colaboraciones/twitter-image.alt.txt", ALT_COLAB);

await mkdir("public/og/prenda", { recursive: true });
for (const slug of slugs) await capturar(`prenda/${slug}`, `public/og/prenda/${slug}.jpg`);
await writeFile("lib/tarjetas.json", JSON.stringify(slugs, null, 2) + "\n");

await navegador.close();
console.log(`Listo: ${slugs.length} prendas + portada + colaboraciones.`);
