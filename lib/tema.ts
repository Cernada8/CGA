import type { CSSProperties } from "react";

/** Tema visual de un drop (cga-marca §6). */
export type TemaDrop = {
  slug: string;
  acento: string;
  textoSobreAcento: string;
  fondoCampana: string;
  nombreVisible: string;
};

export const NEGRO_BASE = "#0a0a0a";

function canal(valor: number): number {
  const c = valor / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminancia(hex: string): number {
  const limpio = hex.replace("#", "");
  const completo =
    limpio.length === 3
      ? limpio
          .split("")
          .map((c) => c + c)
          .join("")
      : limpio;
  const n = Number.parseInt(completo, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Ratio de contraste WCAG entre dos colores hex. */
export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
}

export type InformeContraste = {
  acentoSobreNegro: number;
  textoSobreAcento: number;
  apto: boolean;
};

/** Comprueba que el acento sirve para texto sobre el negro de base (≥ 4,5:1). */
export function comprobarTema(tema: TemaDrop): InformeContraste {
  const acentoSobreNegro = contraste(tema.acento, NEGRO_BASE);
  const textoSobreAcento = contraste(tema.textoSobreAcento, tema.acento);
  return {
    acentoSobreNegro,
    textoSobreAcento,
    apto: acentoSobreNegro >= 4.5 && textoSobreAcento >= 4.5,
  };
}

/** Variables CSS que sobrescribe el tema en <html>. */
export function variablesDeTema(tema: TemaDrop): CSSProperties {
  return {
    "--cga-acento": tema.acento,
    "--cga-texto-sobre-acento": tema.textoSobreAcento,
    "--cga-fondo-campana": tema.fondoCampana,
  } as CSSProperties;
}
