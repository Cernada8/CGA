import Image from "next/image";

// Pieza gráfica incrustada en la costura entre dos secciones:
// la mitad de arriba lleva el fondo de la sección anterior, la de abajo el de la siguiente,
// y la línea que las separa pasa por detrás de la imagen.

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Ancho en CSS; el alto sale de la proporción de la imagen. */
  ancho: string;
  /** `sizes` de next/image, acorde con `ancho`. */
  sizes: string;
  arriba: string; // clases de fondo de la mitad superior
  abajo: string; // clases de fondo de la mitad inferior
  /** Márgenes negativos para pegarla más a las secciones vecinas (su relleno queda por debajo). */
  margen?: string;
};

export function Costura({ src, alt, width, height, ancho, sizes, arriba, abajo, margen = "-mt-10 lg:-mt-16" }: Props) {
  return (
    <div className={`relative isolate z-10 grid place-items-center ${margen}`} style={{ height: `calc(${ancho} * ${height / width})` }}>
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 -z-10 h-1/2 ${arriba}`} />
      <div aria-hidden="true" className={`absolute inset-x-0 bottom-0 -z-10 h-1/2 border-t border-gris-oscuro ${abajo}`} />
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="h-auto" style={{ width: ancho }} />
    </div>
  );
}
