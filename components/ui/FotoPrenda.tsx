import type { ImagenProducto } from "@/lib/drops";
import { FotoPendiente } from "./FotoPendiente";

/**
 * Foto de una prenda. Las fotos se suben ya optimizadas desde el panel (WebP en dos tamaños),
 * así que se sirven tal cual desde /fotos con srcset. Mientras no hay foto, el hueco [FOTO].
 */
export function FotoPrenda({ imagen, alt, sizes = "(min-width: 1024px) 25vw, 50vw" }: { imagen?: ImagenProducto; alt: string; sizes?: string }) {
  if (!imagen?.ruta) return <FotoPendiente alt={imagen?.alt ?? alt} />;
  const pequena = imagen.rutaPequena ?? imagen.ruta;
  return (
    // Fotos propias ya optimizadas: next/image volvería a procesarlas sin ganar nada
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pequena}
      srcSet={`${pequena} 640w, ${imagen.ruta} 1600w`}
      sizes={sizes}
      width={imagen.ancho ?? 800}
      height={imagen.alto ?? 1000}
      alt={imagen.alt}
      loading="lazy"
      decoding="async"
      className="foto-prenda"
    />
  );
}
