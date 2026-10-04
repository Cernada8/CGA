import { cache } from "react";
import type { TemaDrop } from "./tema";

// Tipos alineados con el modelo de datos del CLAUDE.md.
// Fase 2: datos de prueba. Fase 4: estas funciones leerán de Supabase sin cambiar su firma.

export type EstadoDrop = "proximo" | "activo" | "agotado";
export type Linea = "general" | "woman" | "kids";

export type ImagenProducto = {
  ruta: string | null; // null = falta la foto real
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
    fechaLanzamiento: null,
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

export const getDrops = cache(async (): Promise<Drop[]> => DROPS_PRUEBA);

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
