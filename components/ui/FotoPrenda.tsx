import type { ImagenProducto } from "@/lib/drops";
import { FotoPendiente } from "./FotoPendiente";

/**
 * Foto de una prenda. Las fotos ya llegan optimizadas (WebP en dos tamaños: las del panel en /fotos y
 * las del catálogo en /prendas), así que se sirven tal cual con srcset. Mientras no hay foto, el hueco [FOTO].
 * Si hay una segunda foto (la otra cara de la prenda), aparece al pasar el ratón o al enfocar la ficha.
 */
export function FotoPrenda({
  imagen,
  segunda,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  prioridad = false,
}: {
  imagen?: ImagenProducto;
  segunda?: ImagenProducto;
  alt: string;
  sizes?: string;
  prioridad?: boolean;
}) {
  if (!imagen?.ruta) return <FotoPendiente alt={imagen?.alt ?? alt} />;
  if (!segunda?.ruta) return <Img imagen={imagen} sizes={sizes} prioridad={prioridad} />;
  return (
    <div className="foto-doble">
      <Img imagen={imagen} sizes={sizes} prioridad={prioridad} />
      {/* La otra cara: decorativa (la ficha ya tiene nombre y foto principal descrita) y diferida */}
      <Img imagen={segunda} sizes={sizes} decorativa />
    </div>
  );
}

function Img({ imagen, sizes, prioridad = false, decorativa = false }: { imagen: ImagenProducto; sizes: string; prioridad?: boolean; decorativa?: boolean }) {
  const grande = imagen.ruta!;
  const pequena = imagen.rutaPequena ?? grande;
  const anchoGrande = imagen.ancho ?? 1600;
  return (
    // Fotos propias ya optimizadas: next/image volvería a procesarlas sin ganar nada
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pequena}
      srcSet={pequena === grande ? undefined : `${pequena} ${imagen.anchoPequena ?? 640}w, ${grande} ${anchoGrande}w`}
      sizes={sizes}
      width={anchoGrande}
      height={imagen.alto ?? 1000}
      alt={decorativa ? "" : imagen.alt}
      aria-hidden={decorativa || undefined}
      loading={prioridad ? "eager" : "lazy"}
      decoding="async"
      className={decorativa ? "foto-prenda foto-prenda--detras" : "foto-prenda"}
    />
  );
}
