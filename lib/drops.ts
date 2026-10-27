import { cache } from "react";
import type { TemaDrop } from "./tema";

// Tipos alineados con el modelo de datos del CLAUDE.md.
// Fase 2: datos de prueba. Fase 4: estas funciones leerán de Supabase sin cambiar su firma.

export type EstadoDrop = "proximo" | "activo" | "agotado";
export type Linea = "general" | "woman" | "kids";

export type ImagenProducto = {
  ruta: string | null; // null = falta la foto real. Si existe: URL propia (/fotos/…)
  rutaPequena?: string | null;
  ancho?: number;
  alto?: number;
  alt: string;
  tipo: "producto" | "campana";
};

export type Producto = {
  id: string;
  slug: string;
  nombre: string | null; // null = nombre pendiente
  categoria: string;
  descripcion: string | null;
  gramajeG: number | null;
  linea: Linea;
  orden: number;
  imagenes: ImagenProducto[];
};

// Un «drop» es solo la forma interna de agrupar un lanzamiento (su estado y su color).
// En la web no se numeran ni se nombran: hay cosas nuevas y cosas que ya no hay.
export type Drop = {
  id: string;
  slug: string;
  estado: EstadoDrop;
  fechaLanzamiento: string | null; // ISO
  tema: TemaDrop;
  productos: Producto[];
};

const TEMA_CAQUI: TemaDrop = {
  slug: "actual",
  acento: "#a39c84", // caqui del gorila: 7,2:1 sobre negro
  textoSobreAcento: "#0a0a0a",
  fondoCampana: "#a39c84",
  nombreVisible: "Lo nuevo",
};

// DATOS DE PRUEBA. Los acentos reales de cada lanzamiento están pendientes: todos usan el caqui de base.
// Las prendas existen (vistas en @cga.training.hard); fechas, fotos y las prendas que ya no hay
// están pendientes y se muestran como marcadores.
const DROPS_PRUEBA: Drop[] = [
  {
    id: "prueba-activo",
    slug: "actual",
    estado: "activo",
    fechaLanzamiento: null,
    tema: TEMA_CAQUI,
    productos: [
      {
        id: "p1",
        slug: "camiseta-oversize-negra",
        nombre: "Camiseta oversize",
        categoria: "Camiseta",
        descripcion: "Algodón. Corte amplio. Hecha para entrenar y para la calle.",
        gramajeG: 220,
        linea: "general",
        orden: 1,
        imagenes: [{ ruta: null, alt: "Camiseta oversize negra de CGA sobre fondo gris", tipo: "producto" }],
      },
      {
        id: "p2",
        slug: "sudadera-oversize",
        nombre: "Sudadera oversize",
        categoria: "Sudadera",
        descripcion: "Pesa lo que tiene que pesar.",
        gramajeG: 350,
        linea: "general",
        orden: 2,
        imagenes: [{ ruta: null, alt: "Sudadera oversize de CGA con el gorila a la espalda, sobre fondo gris", tipo: "producto" }],
      },
      {
        id: "p3",
        slug: "rashguard",
        nombre: "Rashguard",
        categoria: "Rash",
        descripcion: "Para rodar sin pensar en la ropa.",
        gramajeG: null,
        linea: "general",
        orden: 3,
        imagenes: [{ ruta: null, alt: "Rashguard de CGA sobre fondo gris", tipo: "producto" }],
      },
      {
        id: "p4",
        slug: "shorts-grappling",
        nombre: "Shorts de grappling",
        categoria: "Shorts",
        descripcion: null,
        gramajeG: null,
        linea: "general",
        orden: 4,
        imagenes: [{ ruta: null, alt: "Shorts de grappling de CGA sobre fondo gris", tipo: "producto" }],
      },
    ],
  },
  {
    id: "prueba-proximo",
    slug: "proximo",
    estado: "proximo",
    // Confirmada por el cliente: viernes 30 de octubre de 2026 a las 20:00 (hora peninsular, ya en horario de invierno).
    // La prenda no se enseña hasta ese día.
    fechaLanzamiento: "2026-10-30T20:00:00+01:00",
    tema: TEMA_CAQUI,
    productos: [],
  },
  {
    id: "prueba-agotado",
    slug: "agotado",
    estado: "agotado",
    fechaLanzamiento: null,
    tema: { ...TEMA_CAQUI, slug: "agotado", nombreVisible: "Ya no hay" },
    productos: [1, 2, 3].map((n) => ({
      id: `agotado-${n}`,
      slug: `agotado-${n}`,
      nombre: null,
      categoria: "",
      descripcion: null,
      gramajeG: null,
      linea: "general" as const,
      orden: n,
      imagenes: [{ ruta: null, alt: "Prenda de CGA que ya no está disponible", tipo: "producto" as const }],
    })),
  },
];

// ---------- Lectura desde Supabase (si está configurado) ----------

type FilaDrop = { id: string; estado: EstadoDrop; fecha_lanzamiento: string | null; acento: string; orden: number };
type FilaProducto = {
  id: string;
  drop_id: string;
  nombre: string | null;
  categoria: string;
  descripcion: string | null;
  gramaje_g: number | null;
  linea: Linea;
  agotado: boolean;
  orden: number;
  imagenes_producto: { ruta_storage: string; ruta_pequena: string; ancho: number; alto: number; alt: string; orden: number }[];
};

function temaDe(acento: string, slug: string, nombreVisible: string): TemaDrop {
  return { slug, acento, textoSobreAcento: "#0a0a0a", fondoCampana: acento, nombreVisible };
}

function aProducto(f: FilaProducto): Producto {
  const imagenes = [...f.imagenes_producto].sort((a, b) => a.orden - b.orden);
  return {
    id: f.id,
    slug: f.id,
    nombre: f.nombre,
    categoria: f.categoria,
    descripcion: f.descripcion,
    gramajeG: f.gramaje_g,
    linea: f.linea,
    orden: f.orden,
    imagenes: imagenes.length
      ? imagenes.map((i) => ({ ruta: `/fotos/${i.ruta_storage}`, rutaPequena: `/fotos/${i.ruta_pequena}`, ancho: i.ancho, alto: i.alto, alt: i.alt, tipo: "producto" as const }))
      : [{ ruta: null, alt: `${f.nombre ?? "Prenda"} de CGA`, tipo: "producto" as const }],
  };
}

/**
 * Convierte lo que hay en la base en los tres bloques de la web:
 * - «Lo nuevo»: prendas no agotadas de lanzamientos activos o de próximos cuya fecha ya ha llegado.
 * - «Lo próximo»: el lanzamiento próximo más cercano que aún no ha llegado (solo su fecha: sus prendas no se leen).
 * - «Ya no hay»: prendas marcadas como agotadas o de lanzamientos agotados.
 */
async function dropsDesdeSupabase(): Promise<Drop[]> {
  const { clientePublico } = await import("./supabase/publico");
  const db = clientePublico();
  const [drops, productos] = await Promise.all([
    db.from("drops").select("id, estado, fecha_lanzamiento, acento, orden").eq("publicado", true).order("orden"),
    db
      .from("productos")
      .select("id, drop_id, nombre, categoria, descripcion, gramaje_g, linea, agotado, orden, imagenes_producto(ruta_storage, ruta_pequena, ancho, alto, alt, orden)")
      .eq("publicado", true)
      .order("orden"),
  ]);
  if (drops.error || productos.error) throw new Error("No se han podido leer los datos de la web");
  const ahora = Date.now();
  const filas = drops.data as FilaDrop[];
  const prods = productos.data as FilaProducto[];
  const lanzado = (d: FilaDrop) => d.estado === "activo" || (d.estado === "proximo" && d.fecha_lanzamiento !== null && new Date(d.fecha_lanzamiento).getTime() <= ahora);
  const porDrop = (id: string) => prods.filter((p) => p.drop_id === id);

  const activos = filas.filter(lanzado);
  const nuevo: Drop = {
    id: "activo",
    slug: "actual",
    estado: "activo",
    fechaLanzamiento: null,
    tema: temaDe(activos[0]?.acento ?? TEMA_CAQUI.acento, "actual", "Lo nuevo"),
    productos: activos.flatMap((d) => porDrop(d.id)).filter((p) => !p.agotado).map(aProducto),
  };
  const proximo = filas
    .filter((d) => d.estado === "proximo" && d.fecha_lanzamiento && new Date(d.fecha_lanzamiento).getTime() > ahora)
    .sort((a, b) => new Date(a.fecha_lanzamiento!).getTime() - new Date(b.fecha_lanzamiento!).getTime())[0];
  const agotados: Drop[] = filas
    .map((d) => ({
      d,
      prendas: porDrop(d.id).filter((p) => d.estado === "agotado" || (p.agotado && lanzado(d))),
    }))
    .filter(({ prendas }) => prendas.length > 0)
    .map(({ d, prendas }) => ({
      id: d.id,
      slug: `agotado-${d.id}`,
      estado: "agotado" as const,
      fechaLanzamiento: d.fecha_lanzamiento,
      tema: temaDe(d.acento, `agotado-${d.id}`, "Ya no hay"),
      productos: prendas.map(aProducto),
    }));

  return [
    nuevo,
    ...(proximo
      ? [{ id: proximo.id, slug: "proximo", estado: "proximo" as const, fechaLanzamiento: proximo.fecha_lanzamiento, tema: temaDe(proximo.acento, "proximo", "Lo próximo"), productos: [] }]
      : []),
    ...agotados,
  ];
}

export const getDrops = cache(async (): Promise<Drop[]> => {
  const { supabaseConfigurado } = await import("./supabase/config");
  return supabaseConfigurado ? dropsDesdeSupabase() : DROPS_PRUEBA;
});

export const getDropActivo = cache(async (): Promise<Drop | null> => {
  const drops = await getDrops();
  return drops.find((d) => d.estado === "activo") ?? null;
});

export const getProximoDrop = cache(async (): Promise<Drop | null> => {
  const drops = await getDrops();
  return drops.find((d) => d.estado === "proximo") ?? null;
});

export type PrendaAgotada = { producto: Producto; tema: TemaDrop };

/** Prendas que ya no hay, de todos los lanzamientos agotados. Cada una conserva el color de su lanzamiento. */
export const getArchivo = cache(async (): Promise<PrendaAgotada[]> => {
  const drops = await getDrops();
  return drops
    .filter((d) => d.estado === "agotado")
    .flatMap((d) => d.productos.map((producto) => ({ producto, tema: d.tema })));
});

export const TEMA_POR_DEFECTO = TEMA_CAQUI;
