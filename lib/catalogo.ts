import type { ImagenProducto, Producto } from "./drops";
import { MEDIDAS_FOTOS } from "./medidas-fotos";

// Catálogo real con las fotos del cliente TAL CUAL: sin recortes, sin separar delante y detrás y sin
// tocar el fondo. Solo se han reducido de tamaño y pasado a WebP (grande: lado mayor 1600 px; pequeña: 800 px).
// Solo se pone lo que se ve en la foto o en el nombre del archivo: sin descripciones ni datos inventados.
// Cuando el panel esté en marcha, esto se importa una vez a Supabase y la web pasa a leer de allí.

function foto(carpeta: string, archivo: string, alt: string): ImagenProducto {
  const base = `/${carpeta}/${archivo}`;
  const [ancho, alto, anchoPequena] = MEDIDAS_FOTOS[base];
  return { ruta: `${base}.webp`, rutaPequena: `${base}-p.webp`, ancho, alto, anchoPequena, alt, tipo: "producto" };
}

type Prenda = { slug: string; nombre: string; categoria: string; gramajeG?: number; alt: string };

function aProductos(prendas: Prenda[], prefijo: string): Producto[] {
  return prendas.map((p, i) => ({
    id: `${prefijo}-${p.slug}`,
    slug: p.slug,
    nombre: p.nombre,
    categoria: p.categoria,
    descripcion: null,
    gramajeG: p.gramajeG ?? null,
    linea: "general",
    orden: i + 1,
    imagenes: [foto("prendas", p.slug, p.alt)],
  }));
}

// ---------- Lo nuevo ----------
export const PRENDAS_NUEVAS = aProductos(
  [
    {
      slug: "camiseta-oversize-gorila",
      nombre: "Camiseta oversize Gorila",
      categoria: "Camiseta",
      gramajeG: 220,
      alt: "Camiseta oversize negra con el gorila de CGA y «Siempre humildes, nunca sumisos» a la espalda, por delante y por detrás",
    },
    {
      slug: "camiseta-oversize-discos",
      nombre: "Camiseta oversize Discos",
      categoria: "Camiseta",
      gramajeG: 220,
      alt: "Camiseta oversize negra con una pila de discos y «Siempre humildes, nunca sumisos» a la espalda, por delante y por detrás",
    },
    {
      slug: "camiseta-oversize-negra",
      nombre: "Camiseta oversize negra",
      categoria: "Camiseta",
      alt: "Camiseta oversize negra con «CGA Training Hard» en letra caligráfica blanca, por delante y por detrás",
    },
    {
      slug: "camiseta-oversize-blanca",
      nombre: "Camiseta oversize blanca",
      categoria: "Camiseta",
      alt: "Camiseta oversize blanca con «CGA Training Hard» en letra caligráfica negra, por delante y por detrás",
    },
    {
      slug: "sudadera-algodon-negra",
      nombre: "Sudadera de algodón negra",
      categoria: "Sudadera",
      alt: "Dos sudaderas negras de algodón con «CGA Training Hard» en letra caligráfica, por delante y por detrás",
    },
    {
      slug: "sudadera-negra",
      nombre: "Sudadera negra",
      categoria: "Sudadera",
      alt: "Sudadera negra con capucha: «CGA» por delante y el gorila de CGA a la espalda",
    },
    {
      slug: "chaqueta-softshell",
      nombre: "Chaqueta softshell",
      categoria: "Chaqueta",
      alt: "Chaqueta softshell negra con capucha y cremallera: «CGA» en el pecho y el gorila de CGA a la espalda",
    },
    {
      slug: "camiseta-tecnica-negra",
      nombre: "Camiseta técnica negra",
      categoria: "Camiseta técnica",
      alt: "Camiseta técnica negra: «CGA» por delante y el gorila de CGA a la espalda",
    },
    {
      slug: "tirantes-negra",
      nombre: "Camiseta de tirantes negra",
      categoria: "Tirantes",
      alt: "Camiseta de tirantes negra con «CGA Training Hard», por delante y por detrás",
    },
    {
      slug: "top-negro",
      nombre: "Top negro",
      categoria: "Top",
      alt: "Top deportivo negro estampado con «CGA Training Hard», por delante y por detrás",
    },
    {
      slug: "mallas-negras",
      nombre: "Mallas largas negras",
      categoria: "Mallas",
      alt: "Mallas largas negras con el estampado del gorila y la cinturilla de CGA, por delante y por detrás",
    },
    {
      slug: "mallas-blanco-negro",
      nombre: "Mallas largas blanco y negro",
      categoria: "Mallas",
      alt: "Mallas largas en blanco y en negro con el estampado del gorila",
    },
    {
      slug: "mallas-cortas-negras",
      nombre: "Mallas cortas negras",
      categoria: "Mallas",
      alt: "Mallas cortas negras estampadas con «CGA Training Hard» en la cinturilla, por delante y por detrás",
    },
  ],
  "nuevo",
);

// ---------- Ya no hay ----------
const sudadera = (slug: string, color: string): Prenda => ({
  slug,
  nombre: `Sudadera ${color}`,
  categoria: "Sudadera",
  alt: `Sudadera ${color} con capucha: «CGA» por delante y el gorila de CGA a la espalda`,
});
const tecnica = (slug: string, color: string): Prenda => ({
  slug,
  nombre: `Camiseta técnica ${color}`,
  categoria: "Camiseta técnica",
  alt: `Camiseta técnica ${color} con «CGA Training Hard», por delante y por detrás`,
});

export const PRENDAS_AGOTADAS = aProductos(
  [
    {
      slug: "tirantes-abuso-papa",
      nombre: "Camiseta de tirantes Abuso Papa",
      categoria: "Tirantes",
      alt: "Camiseta de tirantes negra: «CGA Training Hard» por delante y «Abuso Papa» con el número 21 a la espalda",
    },
    {
      slug: "gorras",
      nombre: "Gorras y gorro",
      categoria: "Gorras",
      alt: "Gorras negras y un gorro rojo de CGA sobre el césped de un gimnasio",
    },
    {
      slug: "tecnica-gorila-camuflaje",
      nombre: "Camiseta técnica Gorila",
      categoria: "Camiseta técnica",
      alt: "Camisetas técnicas de camuflaje en varios colores con la cara del gorila de CGA",
    },
    sudadera("sudadera-negra-amarilla", "negra y amarilla"),
    sudadera("sudadera-amarilla", "amarilla"),
    sudadera("sudadera-azul", "azul"),
    sudadera("sudadera-roja", "roja"),
    sudadera("sudadera-rosa", "rosa"),
    {
      slug: "sudadera-negra-letras",
      nombre: "Sudadera negra Training Hard",
      categoria: "Sudadera",
      alt: "Sudadera negra estampada con «CGA Training Hard», por delante y por detrás",
    },
    tecnica("tecnica-negra-amarilla", "negra y amarilla"),
    tecnica("tecnica-verde-amarilla", "verde y amarilla"),
    tecnica("tecnica-azul", "azul"),
    tecnica("tecnica-beige", "beige"),
    tecnica("tecnica-blanca", "blanca"),
    tecnica("tecnica-blanca-negra", "negra con mangas blancas"),
    tecnica("tecnica-negra-blanca", "negra estampada"),
  ],
  "agotado",
);

// ---------- Equipaciones hechas con academias (sin nombres: no están confirmados) ----------
export type Equipacion = { slug: string; foto: ImagenProducto };

const equipacion = (slug: string, descripcion: string): Equipacion => ({
  slug,
  foto: foto("colabs", slug, `Equipación ${descripcion}: rashguard y pantalón, por delante y por detrás`),
});

export const EQUIPACIONES: Equipacion[] = [
  equipacion("equipacion-corona-negra", "negra y dorada con corona"),
  equipacion("equipacion-corona-roja", "roja y dorada con corona"),
  equipacion("equipacion-negra", "negra de CGA"),
  equipacion("equipacion-blanca", "blanca de CGA"),
  equipacion("equipacion-guerrero", "negra con guerrero"),
];
