import type { Producto } from "./drops";

// Orden de las prendas en la web: por familias, para que «Lo nuevo» y «Ya no hay» no salgan mezclados.
// La familia sale de la categoría de cada prenda (catálogo estático o columna `categoria` de Supabase).

export type Grupo = {
  id: string;
  nombre: string;
  /** Fotos apaisadas (prendas por delante y por detrás lado a lado): necesitan columnas más anchas */
  apaisado: boolean;
  categorias: string[];
};

// Pocas familias y amplias: grupos de una sola prenda dejan huecos y no ordenan nada.
// Dentro de cada familia, primero el orden de `categorias` (oversize antes que técnicas…) y luego el de la prenda.
export const GRUPOS: Grupo[] = [
  {
    id: "camisetas",
    nombre: "Camisetas y tirantes",
    apaisado: false,
    categorias: ["camiseta", "camiseta tecnica", "rashguard", "rash", "tirantes"],
  },
  { id: "sudaderas", nombre: "Sudaderas y chaquetas", apaisado: true, categorias: ["sudadera", "chaqueta"] },
  { id: "mallas-y-tops", nombre: "Mallas, shorts y tops", apaisado: false, categorias: ["mallas", "shorts", "short", "top"] },
  { id: "gorras", nombre: "Gorras y gorros", apaisado: false, categorias: ["gorras", "gorra", "gorro"] },
];

const OTRAS: Grupo = { id: "otras", nombre: "Más prendas", apaisado: false, categorias: [] };

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export function grupoDe(producto: Producto): Grupo {
  const categoria = normalizar(producto.categoria ?? "");
  return GRUPOS.find((g) => g.categorias.includes(categoria)) ?? OTRAS;
}

const posicion = (grupo: Grupo, p: Producto) => grupo.categorias.indexOf(normalizar(p.categoria ?? ""));

/** Agrupa respetando el orden de GRUPOS y, dentro de cada uno, el orden de la prenda. Los grupos vacíos no salen. */
export function agrupar<T>(items: T[], producto: (item: T) => Producto): { grupo: Grupo; items: T[] }[] {
  return [...GRUPOS, OTRAS]
    .map((grupo) => ({
      grupo,
      items: items
        .filter((i) => grupoDe(producto(i)).id === grupo.id)
        .sort((a, b) => posicion(grupo, producto(a)) - posicion(grupo, producto(b)) || producto(a).orden - producto(b).orden),
    }))
    .filter((g) => g.items.length > 0);
}
