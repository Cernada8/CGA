import Link from "next/link";
import { Cinta } from "@/components/ui/Cinta";
import { FotoPrenda } from "@/components/ui/FotoPrenda";
import type { PrendaAgotada } from "@/lib/drops";
import { variablesDeTema } from "@/lib/tema";

/** Prendas que ya no hay. Cada una conserva el color del lanzamiento en el que salió y lleva el sello de agotado. */
export function Archivo({ prendas }: { prendas: PrendaAgotada[] }) {
  return (
    <section aria-labelledby="ya-no-hay" className="border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="ya-no-hay" entradilla="Lo que salió y no vuelve. Quien lo tiene, lo tiene.">
          Ya no hay
        </Cinta>
        {prendas.length > 0 ? (
          <ul className="mt-12 columns-2 gap-x-3 sm:gap-x-5 lg:columns-3">
            {prendas.map(({ producto, tema }) => (
              <li key={producto.id} id={producto.slug} style={variablesDeTema(tema)} className="mb-8 scroll-mt-24 break-inside-avoid">
                <article className="ficha ficha--agotada">
                  <Link href={`/prenda/${producto.slug}`} tabIndex={-1} aria-hidden="true" className="ficha__foto-enlace ficha__foto relative">
                    <FotoPrenda
                      imagen={producto.imagenes[0]}
                      alt={producto.nombre ?? "Prenda de CGA que ya no está disponible"}
                      sizes="(min-width: 1024px) 33vw, 50vw"
                    />
                    <span className="sello-agotado" aria-hidden="true">
                      Agotado
                    </span>
                  </Link>
                  <h3 className="ficha__nombre mt-3 text-base font-bold leading-snug [font-stretch:85%] sm:text-lg">
                    <Link href={`/prenda/${producto.slug}`} className="ficha__enlace">
                      {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gris">No vuelve.</p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-12 text-lg text-gris">Todavía no hay nada que ya no esté.</p>
        )}
      </div>
    </section>
  );
}
