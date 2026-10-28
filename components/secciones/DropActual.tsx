import Link from "next/link";
import { AnimarTarjetas } from "@/components/animacion/AnimarTarjetas";
import { Cinta } from "@/components/ui/Cinta";
import { FotoPrenda } from "@/components/ui/FotoPrenda";
import type { Drop, Producto } from "@/lib/drops";
import { INSTAGRAM_DM_URL } from "@/lib/marca";

const NOMBRE_LINEA: Record<Producto["linea"], string | null> = {
  general: null,
  woman: "CGA Woman",
  kids: "CGA Kids",
};

export function DropActual({ drop, hayArchivo = true }: { drop: Drop | null; hayArchivo?: boolean }) {
  return (
    <section aria-labelledby="lo-nuevo" className="scroll-mt-20 border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="lo-nuevo" entradilla={hayArchivo ? "Cada prenda sale una vez. Cuando se acaba, pasa a «Ya no hay» y no vuelve." : "Cada prenda sale una vez. Cuando se acaba, se acaba."}>Lo nuevo</Cinta>

        {drop && drop.productos.length > 0 ? (
          <AnimarTarjetas>
            {/* Columnas tipo muro: cada foto con su proporción original, sin recortes */}
            <ul className="mt-12 columns-2 gap-x-4 sm:gap-x-6 lg:columns-3">
              {drop.productos.map((p) => (
                <li key={p.id} id={p.slug} data-anim="tarjeta" className="mb-10 scroll-mt-24 break-inside-avoid">
                  <FichaProducto producto={p} />
                </li>
              ))}
            </ul>
          </AnimarTarjetas>
        ) : (
          <p className="mt-12 text-lg text-gris">Ahora mismo no hay nada nuevo. Lo próximo se anuncia en Instagram.</p>
        )}

        <p className="mt-14 max-w-xl text-lg">
          ¿Te la quieres llevar?{" "}
          <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento">
            Escríbenos por Instagram
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>{" "}
          con el modelo y la talla.
        </p>
      </div>
    </section>
  );
}

function FichaProducto({ producto }: { producto: Producto }) {
  const imagen = producto.imagenes[0];
  const linea = NOMBRE_LINEA[producto.linea];
  return (
    <article className="ficha">
      <Link href={`/prenda/${producto.slug}`} tabIndex={-1} aria-hidden="true" className="ficha__foto-enlace ficha__foto">
        <div data-anim-escala>
          <FotoPrenda imagen={imagen} alt={producto.nombre ?? "Prenda de CGA"} sizes="(min-width: 1024px) 33vw, 50vw" />
        </div>
      </Link>
      <h3 className="ficha__nombre mt-4 text-lg font-bold leading-snug [font-stretch:85%] sm:text-xl">
        <Link href={`/prenda/${producto.slug}`} className="ficha__enlace">
          {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
        </Link>
      </h3>
      {producto.gramajeG || linea ? (
        <p className="mt-1 text-sm text-gris">{[producto.gramajeG ? `${producto.gramajeG} g` : null, linea].filter(Boolean).join(", ")}</p>
      ) : null}
      {producto.descripcion ? <p className="mt-2 text-base text-blanco/85">{producto.descripcion}</p> : null}
    </article>
  );
}
