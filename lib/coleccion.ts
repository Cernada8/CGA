// Equipaciones hechas con academias, colgadas en el perchero de /colaboraciones.
// Los datos viven en lib/coleccion-datos.json, que genera y mantiene `npm run coleccion:importar`
// a partir del prendas.json del recorte (ver scripts/importar-coleccion.mjs). Sin base de datos.
// Imágenes WebP transparentes de 1200×1500 en public/coleccion, tal cual llegan: no se retocan.
import datos from "./coleccion-datos.json";

export type TipoPercha = "camiseta" | "short";

export type CaraPrenda = {
  src: string;
  /** Punto de enganche en px de la imagen de 1200×1500 */
  engancheX: number;
  engancheY: number;
  alt: string;
};

export type PrendaColeccion = {
  slug: string;
  nombre: string | null;
  tipo: TipoPercha;
  /** Equipación a la que pertenece (camiseta + short del mismo conjunto cuelgan juntos y se enlazan) */
  equipacion: string | null;
  /** Opcionales: en una equipación de colaboración no siempre aplican */
  descripcion: string | null;
  tallas: string[];
  /** Etiqueta de tienda colgando de la percha («Nuevo»…). Opcional */
  etiqueta: string | null;
  /** Caja que ocupa la prenda (unión de delante y detrás) en px de la imagen: [x0, y0, x1, y1].
   *  Sirve para ampliarla en la vista grande sin recortar ni tocar la imagen. */
  caja: [number, number, number, number];
  delante: CaraPrenda;
  detras: CaraPrenda;
};

export const ANCHO_IMAGEN = 1200;
export const ALTO_IMAGEN = 1500;

/** Comprueba el JSON al construir la web: si alguien lo edita a mano y lo rompe, el build falla aquí y no en producción */
function validar(prendas: unknown[]): PrendaColeccion[] {
  return prendas.map((bruta, i) => {
    const p = bruta as PrendaColeccion;
    const donde = `lib/coleccion-datos.json, prenda ${i + 1} (${p?.slug ?? "sin slug"})`;
    const caraOk = (c: CaraPrenda | undefined) =>
      !!c && c.src.startsWith("/coleccion/") && Number.isFinite(c.engancheX) && Number.isFinite(c.engancheY) && c.alt.trim().length > 2;
    if (!/^[a-z0-9-]+$/.test(p.slug ?? "")) throw new Error(`${donde}: slug no válido`);
    if (p.tipo !== "camiseta" && p.tipo !== "short") throw new Error(`${donde}: tipo tiene que ser camiseta o short`);
    if (!Array.isArray(p.caja) || p.caja.length !== 4 || !p.caja.every(Number.isFinite)) throw new Error(`${donde}: caja tiene que ser [x0, y0, x1, y1]`);
    if (!caraOk(p.delante) || !caraOk(p.detras)) throw new Error(`${donde}: faltan datos de la cara de delante o de detrás`);
    return { ...p, equipacion: p.equipacion ?? null, tallas: p.tallas ?? [], descripcion: p.descripcion ?? null, etiqueta: p.etiqueta ?? null };
  });
}

export const COLECCION = validar(datos.prendas);

/** La otra pieza de la misma equipación (el short del rashguard y al revés), si la hay */
export function parejaDe(prenda: PrendaColeccion, prendas: PrendaColeccion[]): PrendaColeccion | null {
  if (!prenda.equipacion) return null;
  return prendas.find((p) => p.equipacion === prenda.equipacion && p.slug !== prenda.slug) ?? null;
}
