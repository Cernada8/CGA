import { Cinta } from "@/components/ui/Cinta";
import type { PrendaAgotada } from "@/lib/drops";
import { variablesDeTema } from "@/lib/tema";

/** Prendas que ya no hay. Cada una conserva el color del lanzamiento en el que salió. */
export function Archivo({ prendas }: { prendas: PrendaAgotada[] }) {
  return (
    <section aria-labelledby="ya-no-hay" className="border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Cinta id="ya-no-hay">Ya no hay</Cinta>
          <p className="max-w-sm text-lg text-blanco/90">Lo que salió y no vuelve.</p>
        </div>
        {prendas.length > 0 ? (
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {prendas.map(({ producto, tema }) => (
              <li key={producto.id} style={variablesDeTema(tema)}>
                <article>
                  <div
                    role="img"
                    aria-label={`${producto.imagenes[0]?.alt ?? "Prenda de CGA que ya no está disponible"} (foto pendiente)`}
                    className="grid aspect-[4/5] place-items-center bg-gris-oscuro font-sello text-lg text-blanco"
                  >
                    [FOTO]
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug [font-stretch:85%] sm:text-xl">
                    {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
                  </h3>
                  <p className="mt-2 inline-block rounded-full bg-acento px-3 py-0.5 text-sm font-bold text-sobre-acento">
                    Agotado. No vuelve.
                  </p>
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
