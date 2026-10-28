import type { ImagenProducto, Producto } from "./drops";

// Catálogo real (fotos del cliente, recortadas y optimizadas en public/prendas: WebP 1200×1500 y 600×750).
// Solo se pone lo que se ve en la foto o en el nombre del archivo: sin descripciones ni datos inventados.
// Cuando el panel esté en marcha, esto se importa una vez a Supabase y la web pasa a leer de allí.

const ANCHO = 1200;
const ALTO = 1500;

function foto(carpeta: string, archivo: string, alt: string): ImagenProducto {
  return {
    ruta: `/${carpeta}/${archivo}.webp`,
    rutaPequena: `/${carpeta}/${archivo}-p.webp`,
    ancho: ANCHO,
    alto: ALTO,
    anchoPequena: ANCHO / 2,
    alt,
    tipo: "producto",
  };
}

type Prenda = {
  slug: string;
  nombre: string;
  categoria: string;
  gramajeG?: number;
  /** Texto alternativo de la foto principal; la segunda (si hay) es la otra cara de la prenda */
  alt: string;
  altDetras?: string;
};

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
    imagenes: [foto("prendas", p.slug, p.alt), ...(p.altDetras ? [foto("prendas", `${p.slug}-2`, p.altDetras)] : [])],
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
      alt: "Camiseta oversize negra con el gorila de CGA y «Siempre humildes, nunca sumisos» a la espalda",
    },
    {
      slug: "camiseta-oversize-discos",
      nombre: "Camiseta oversize Discos",
      categoria: "Camiseta",
      gramajeG: 220,
      alt: "Camiseta oversize negra con una pila de discos y «Siempre humildes, nunca sumisos» a la espalda",
    },
    {
      slug: "camiseta-oversize-negra",
      nombre: "Camiseta oversize negra",
      categoria: "Camiseta",
      alt: "Camiseta oversize negra con «CGA Training Hard» en letra caligráfica blanca a la espalda",
    },
    {
      slug: "camiseta-oversize-blanca",
      nombre: "Camiseta oversize blanca",
      categoria: "Camiseta",
      alt: "Camiseta oversize blanca con «CGA Training Hard» en letra caligráfica negra a la espalda",
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
      alt: "Sudadera negra con capucha y el gorila de CGA a la espalda",
      altDetras: "Sudadera negra con capucha y «CGA» en blanco por delante",
    },
    {
      slug: "chaqueta-softshell",
      nombre: "Chaqueta softshell",
      categoria: "Chaqueta",
      alt: "Chaqueta softshell negra con capucha y cremallera, con «CGA» pequeño en el pecho",
      altDetras: "Espalda de la chaqueta softshell negra con el gorila de CGA y el lema",
    },
    {
      slug: "camiseta-tecnica-negra",
      nombre: "Camiseta técnica negra",
      categoria: "Camiseta técnica",
      alt: "Camiseta técnica negra con «CGA» en blanco por delante",
      altDetras: "Espalda de la camiseta técnica negra con el gorila de CGA y el lema",
    },
    {
      slug: "tirantes-negra",
      nombre: "Camiseta de tirantes negra",
      categoria: "Tirantes",
      alt: "Camiseta de tirantes negra con «CGA Training Hard» en blanco por delante",
      altDetras: "Espalda de la camiseta de tirantes negra con «CGA Training Hard» en grande",
    },
    {
      slug: "top-negro",
      nombre: "Top negro",
      categoria: "Top",
      alt: "Top deportivo negro estampado con «CGA Training Hard» en blanco por delante",
      altDetras: "Espalda del top deportivo negro con tirantes cruzados",
    },
    {
      slug: "mallas-negras",
      nombre: "Mallas largas negras",
      categoria: "Mallas",
      alt: "Mallas largas negras con el estampado del gorila en gris y la cinturilla de CGA",
      altDetras: "Mallas largas negras vistas por detrás",
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
      alt: "Mallas cortas negras estampadas con «CGA Training Hard» en la cinturilla",
      altDetras: "Mallas cortas negras vistas por detrás",
    },
  ],
  "nuevo",
);

// ---------- Ya no hay ----------
const sudadera = (slug: string, color: string): Prenda => ({
  slug,
  nombre: `Sudadera ${color}`,
  categoria: "Sudadera",
  alt: `Sudadera ${color} con capucha y el gorila de CGA a la espalda`,
  altDetras: `Sudadera ${color} con capucha y «CGA» por delante`,
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
      alt: "Camiseta de tirantes negra con «CGA Training Hard» en letra caligráfica por delante",
      altDetras: "Espalda de la camiseta de tirantes con «Abuso Papa» y el número 21",
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
      alt: "Camiseta técnica de camuflaje gris con la cara del gorila de CGA",
      altDetras: "Camiseta técnica de camuflaje rojo con la cara del gorila de CGA",
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
      alt: "Sudadera negra estampada con «CGA Training Hard» en grande a la espalda",
      altDetras: "Sudadera negra estampada con «CGA Training Hard» por delante",
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
export type Equipacion = { slug: string; delante: ImagenProducto; detras: ImagenProducto };

const equipacion = (slug: string, descripcion: string): Equipacion => ({
  slug,
  delante: foto("colabs", slug, `Equipación ${descripcion}: rashguard y pantalón por delante`),
  detras: foto("colabs", `${slug}-2`, `Equipación ${descripcion}: rashguard y pantalón por detrás`),
});

export const EQUIPACIONES: Equipacion[] = [
  equipacion("equipacion-corona-negra", "negra y dorada con corona"),
  equipacion("equipacion-corona-roja", "roja y dorada con corona"),
  equipacion("equipacion-negra", "negra de CGA"),
  equipacion("equipacion-blanca", "blanca de CGA"),
  equipacion("equipacion-guerrero", "negra con guerrero"),
];
