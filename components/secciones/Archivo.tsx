import { Cinta } from "@/components/ui/Cinta";
import { FotoPendiente } from "@/components/ui/FotoPendiente";
import type { PrendaAgotada } from "@/lib/drops";
import { variablesDeTema } from "@/lib/tema";

/** Prendas que ya no hay. Cada una conserva el color del lanzamiento en el que salió y lleva el sello de agotado. */
export function Archivo({ prendas }: { prendas: PrendaAgotada[] }) {
  return (
    <section aria-labelledby="ya-no-hay" className="border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="ya-no-hay" entradilla="Lo que salió y no vuelve.">
          Ya no hay
        </Cinta>
        {prendas.length > 0 ? (
          <ul className={`mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 ${prendas.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
            {prendas.map(({ producto, tema }) => (
              <li key={producto.id} style={variablesDeTema(tema)}>
                <article className="ficha ficha--agotada">
                  <div className="relative">
                    <FotoPendiente alt={producto.imagenes[0]?.alt ?? "Prenda de CGA que ya no está disponible"} />
                    <span className="sello-agotado" aria-hidden="true">
                      Agotado
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug [font-stretch:85%] sm:text-xl">
                    {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
                  </h3>
                  <p className="mt-1 text-sm text-gris">Agotado. No vuelve.</p>
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
