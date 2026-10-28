// Embajadores de CGA. Nombres tal y como los ha pasado el cliente (nombre de cada carpeta de fotos).
// Fotos recortadas a 4:5 y optimizadas en public/embajadores (WebP 1000×1250 y 500×625).
// Sin palmarés, disciplinas ni cuentas de Instagram: no están confirmados.

export type FotoEmbajador = { ruta: string; rutaPequena: string; alt: string };
export type Embajador = { slug: string; nombre: string; fotos: [FotoEmbajador, FotoEmbajador?] };

const foto = (archivo: string, alt: string): FotoEmbajador => ({
  ruta: `/embajadores/${archivo}.webp`,
  rutaPequena: `/embajadores/${archivo}-p.webp`,
  alt,
});

export const ANCHO_EMBAJADOR = 1000;
export const ALTO_EMBAJADOR = 1250;

export const EMBAJADORES: Embajador[] = [
  {
    slug: "nayanesh-ayman",
    nombre: "Nayanesh Ayman",
    fotos: [
      foto("nayanesh", "Nayanesh Ayman lanzando un rodillazo en el aire con camiseta de CGA"),
      foto("nayanesh-2", "Nayanesh Ayman gritando a cámara con la camiseta del gorila de CGA"),
    ],
  },
  {
    slug: "shido-boris-esperanca",
    nombre: "Shido Boris Esperança",
    fotos: [
      foto("shido", "Rodillazo en el aire con camiseta roja y negra de CGA y guantes de MMA"),
      foto("shido-2", "De espaldas y con los brazos abiertos, la espalda tatuada, en un tatami"),
    ],
  },
  {
    slug: "chamo",
    nombre: "Chamo",
    fotos: [
      foto("chamo", "Chamo haciendo press con mancuernas en un banco, con camiseta azul de CGA"),
      foto("chamo-2", "Dos chicos en un gimnasio con camisetas y sudaderas de CGA extendidas en el suelo"),
    ],
  },
  {
    slug: "enrique-mourinho",
    nombre: "Enrique Mourinho",
    fotos: [
      foto("enrique", "Enrique Mourinho con camiseta oversize negra de CGA sobre un fondo rojo"),
      foto("enrique-2", "Enrique Mourinho espalda con espalda junto a otra persona, los dos con sudadera negra y amarilla y mallas estampadas de CGA"),
    ],
  },
];
