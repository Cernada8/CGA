#!/usr/bin/env node
// Importa prendas recortadas al perchero de /colaboraciones.
//
//   npm run coleccion:importar -- /ruta/a/la/carpeta-del-recorte
//
// La carpeta trae un prendas.json (una entrada por cara: slug, nombre, tipo, cara, archivo_web,
// punto_enganche) y los WebP transparentes de 1200×1500. El script:
//   1. agrupa las caras por prenda (slug sin «-delante» / «-detras»);
//   2. copia los WebP TAL CUAL a public/coleccion/ (no los reencoda ni los retoca);
//   3. mide la caja que ocupa cada prenda (píxeles no transparentes) para ampliarla sin recortar;
//   4. crea o actualiza lib/coleccion-datos.json SIN pisar lo que se haya escrito a mano
//      (nombre, textos alternativos, descripción, tallas, etiqueta) ni cambiar el orden;
//   5. agrupa cada equipación (camiseta + short del mismo slug) para que cuelguen juntas.
// Se puede lanzar las veces que haga falta: es idempotente.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..");
const DATOS = path.join(RAIZ, "lib/coleccion-datos.json");
const DESTINO = path.join(RAIZ, "public/coleccion");
const ANCHO = 1200;
const ALTO = 1500;
const TIPOS = new Set(["camiseta", "short"]);
const NOMBRE_TIPO = { camiseta: "Rashguard", short: "Pantalón corto" };
/** Códigos de etiqueta del prendas.json → texto de la etiqueta de tienda. Los desconocidos se escriben tal cual, en frase. */
const ETIQUETAS = { "equipacion-completa": "Equipación completa", nuevo: "Nuevo", "edicion-limitada": "Edición limitada" };
const textoEtiqueta = (codigo) => {
  const c = (codigo ?? "").trim();
  if (!c) return null;
  if (ETIQUETAS[c]) return ETIQUETAS[c];
  const t = c.replace(/[-_]+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const carpeta = process.argv[2];
if (!carpeta) {
  console.error("Uso: npm run coleccion:importar -- /ruta/a/la/carpeta-con-prendas.json");
  process.exit(1);
}

/** Caja de los píxeles visibles (alfa > 8) de una imagen RGBA */
async function medirCaja(archivo) {
  const { data, info } = await sharp(archivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error(`${archivo} es completamente transparente`);
  return [x0, y0, x1 + 1, y1 + 1];
}

const entradas = JSON.parse(await readFile(path.join(carpeta, "prendas.json"), "utf8"));
const actuales = JSON.parse(await readFile(DATOS, "utf8").catch(() => '{"prendas":[]}'));
const porSlug = new Map(actuales.prendas.map((p) => [p.slug, p]));
const avisos = [];
const grupos = new Map();

for (const e of entradas) {
  const cara = e.cara === "detras" ? "detras" : e.cara === "delante" ? "delante" : null;
  if (!cara) throw new Error(`${e.slug}: «cara» tiene que ser delante o detras`);
  if (!TIPOS.has(e.tipo)) throw new Error(`${e.slug}: «tipo» tiene que ser camiseta o short (hay «${e.tipo}»)`);
  const base = e.slug.replace(/-(delante|detras)$/, "");
  const g = grupos.get(base) ?? { tipo: e.tipo, nombre: "", etiqueta: null };
  if (g.tipo !== e.tipo) throw new Error(`${base}: delante y detrás tienen tipos distintos`);
  g.nombre ||= (e.nombre ?? "").trim();
  g.etiqueta ??= textoEtiqueta(e.etiqueta);
  // Equipación a la que pertenece: el slug sin la pieza (s23-machine-rojo-camiseta → s23-machine-rojo)
  g.equipacion = base.replace(/-(camiseta|short)$/, "");

  const origen = path.join(carpeta, e.archivo_web);
  const meta = await sharp(origen).metadata();
  if (meta.format !== "webp" || meta.width !== ANCHO || meta.height !== ALTO || !meta.hasAlpha) {
    throw new Error(`${e.archivo_web}: tiene que ser WebP transparente de ${ANCHO}×${ALTO} (es ${meta.format} ${meta.width}×${meta.height})`);
  }
  await mkdir(DESTINO, { recursive: true });
  const archivo = `${e.slug}.webp`;
  await copyFile(origen, path.join(DESTINO, archivo));
  g[cara] = {
    src: `/coleccion/${archivo}`,
    engancheX: e.punto_enganche.x,
    engancheY: e.punto_enganche.y,
    caja: await medirCaja(origen),
  };
  grupos.set(base, g);
}

for (const [slug, g] of grupos) {
  if (!g.delante || !g.detras) throw new Error(`${slug}: faltan la cara de delante o la de detrás`);
  const previa = porSlug.get(slug);
  const nombre = g.nombre || previa?.nombre || null;
  if (!nombre) avisos.push(`${slug}: sin nombre. Escríbelo en lib/coleccion-datos.json (la web no se publica con huecos).`);
  const rotulo = nombre ?? NOMBRE_TIPO[g.tipo];
  const cara = (c, lado) => ({
    src: g[c].src,
    engancheX: g[c].engancheX,
    engancheY: g[c].engancheY,
    alt: previa?.[c]?.alt ?? `${rotulo}, por ${lado}`,
  });
  if (!previa) avisos.push(`${slug}: textos alternativos genéricos. Descríbela mejor en lib/coleccion-datos.json (color, diseño).`);
  const [a, b] = [g.delante.caja, g.detras.caja];
  porSlug.set(slug, {
    slug,
    nombre,
    tipo: g.tipo,
    equipacion: previa?.equipacion ?? g.equipacion,
    descripcion: previa?.descripcion ?? null,
    tallas: previa?.tallas ?? [],
    etiqueta: previa?.etiqueta ?? g.etiqueta,
    caja: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])],
    delante: cara("delante", "delante"),
    detras: cara("detras", "detrás"),
  });
}

// Mismo orden que antes y las nuevas al final, pero cada equipación junta (primero la camiseta y luego el short),
// para que en el perchero se lean como conjuntos
const orden = [...new Set([...actuales.prendas.map((p) => p.slug), ...grupos.keys()])].map((s) => porSlug.get(s));
const equipos = [...new Set(orden.map((p) => p.equipacion ?? p.slug))];
const PIEZA = { camiseta: 0, short: 1 };
const prendas = orden
  .map((p, i) => ({ p, i }))
  .sort((a, b) => equipos.indexOf(a.p.equipacion ?? a.p.slug) - equipos.indexOf(b.p.equipacion ?? b.p.slug) || PIEZA[a.p.tipo] - PIEZA[b.p.tipo] || a.i - b.i)
  .map(({ p }) => p);
// Listas de números en una sola línea (más fácil de leer y de revisar en los diffs)
const texto = JSON.stringify({ prendas }, null, 2).replace(/\[\s+([\d,\s]+?)\s+\]/g, (_, n) => `[${n.split(/,\s*/).join(", ")}]`);
await writeFile(DATOS, `${texto}\n`);

console.log(`Listo: ${grupos.size} prenda(s) importada(s), ${prendas.length} en el perchero.`);
for (const a of avisos) console.warn(`  ⚠ ${a}`);
