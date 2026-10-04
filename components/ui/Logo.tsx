import Image from "next/image";

// Logos oficiales (LOGOS CGA.pdf, Illustrator) convertidos a SVG en public/marca.
// cga-marca §5: sin degradados, sombras ni deformaciones; tamaño mínimo de 32 px.

type InsigniaProps = {
  tamano?: number;
  /** Texto alternativo. Vacío si el contenedor ya tiene nombre accesible (p. ej. un enlace con aria-label). */
  alt?: string;
  prioridad?: boolean;
};

/** Insignia circular con el gorila (a todo color). */
export function Insignia({ tamano = 44, alt = "CGA Training Hard", prioridad = false }: InsigniaProps) {
  return (
    <Image
      src="/marca/cga-insignia.svg"
      width={Math.max(32, tamano)}
      height={Math.max(32, tamano)}
      alt={alt}
      priority={prioridad}
      unoptimized
      className="shrink-0"
    />
  );
}

const PROPORCION = { horizontal: 712.75 / 545.5, vertical: 480 / 765.75 } as const;

type MarcaTextoProps = {
  variante: "horizontal" | "vertical";
  /** Ancho en px; el alto sale de la proporción del logo. */
  ancho: number;
  className?: string;
};

/**
 * Logotipo de texto («CGA Training Hard»). Toma el color de `currentColor`
 * (blanco, negro o el acento del drop) usando el SVG como máscara.
 */
export function MarcaTexto({ variante, ancho, className = "" }: MarcaTextoProps) {
  const url = `url(/marca/cga-texto-${variante}.svg)`;
  return (
    <span
      role="img"
      aria-label="CGA Training Hard"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: ancho,
        height: Math.round(ancho / PROPORCION[variante]),
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
