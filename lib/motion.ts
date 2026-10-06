// Tokens de movimiento de CGA. Todo el proyecto usa estos valores; nunca números sueltos.
// Las variables CSS equivalentes (para hovers en CSS) viven en app/globals.css y un test
// comprueba que coinciden con este archivo.

export const CURVA = {
  entrada: "power3.out",
  salida: "power2.in",
  transicion: "power2.inOut",
  /** Solo para el revelado C-G-A */
  golpe: "expo.out",
} as const;

/** Equivalentes cubic-bezier para CSS */
export const CURVA_CSS = {
  entrada: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  salida: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
  transicion: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
  golpe: "cubic-bezier(0.19, 1, 0.22, 1)",
} as const;

/** Segundos */
export const DURACION = {
  /** hover, estados */
  rapida: 0.2,
  /** entradas de elementos */
  media: 0.5,
  /** titulares grandes, revelados */
  lenta: 0.9,
} as const;

export const STAGGER = 0.06;
export const STAGGER_MAX = 0.4;

/** Desplazamientos en px (rango permitido 24–40) */
export const DISTANCIA = { corta: 24, larga: 40 } as const;

/** Stagger que nunca acumula más de STAGGER_MAX en un grupo de n elementos. */
export function staggerSeguro(n: number, base: number = STAGGER): number {
  if (n <= 1) return 0;
  return Math.min(base, STAGGER_MAX / (n - 1));
}

/** Consultas para gsap.matchMedia() */
export const CONSULTAS = {
  movimiento: "(prefers-reduced-motion: no-preference)",
  reducido: "(prefers-reduced-motion: reduce)",
  movil: "(max-width: 767px)",
  escritorio: "(min-width: 768px)",
} as const;
