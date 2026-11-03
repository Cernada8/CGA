import Link from "next/link";
import { Cinta } from "@/components/ui/Cinta";
import { FotoPrenda } from "@/components/ui/FotoPrenda";
import { AtajosGrupos, clasesRejilla, TituloGrupo } from "@/components/ui/GruposPrendas";
import { agrupar } from "@/lib/categorias";
import type { PrendaAgotada } from "@/lib/drops";
import { variablesDeTema } from "@/lib/tema";

/** Prendas que ya no hay. Cada una conserva el color del lanzamiento en el que salió y lleva el sello de agotado. */
export function Archivo({ prendas }: { prendas: PrendaAgotada[] }) {
  // Por familias (técnicas, sudaderas…), como en «Lo nuevo»
  const grupos = agrupar(prendas, (p) => p.producto);
  return (
    <section aria-labelledby="ya-no-hay" className="border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="ya-no-hay" entradilla="Lo que salió y no vuelve. Quien lo tiene, lo tiene.">
          Ya no hay
        </Cinta>
        {prendas.length > 0 ? (
          <>
            <AtajosGrupos seccion="ya-no-hay" nombreSeccion="Ya no hay" grupos={grupos.map((g) => g.grupo)} />
            <div className="grupos-prendas">
              {grupos.map(({ grupo, items }) => (
                <section key={grupo.id} aria-labelledby={`ya-no-hay-${grupo.id}`} className="grupo-prendas">
                  <TituloGrupo seccion="ya-no-hay" grupo={grupo} />
                  <ul className={clasesRejilla(grupo, { carril: true })}>
                    {items.map(({ producto, tema }) => (
                      <li key={producto.id} id={producto.slug} style={variablesDeTema(tema)} className="scroll-mt-24">
                        <article className="ficha ficha--agotada">
                          <Link href={`/prenda/${producto.slug}`} tabIndex={-1} aria-hidden="true" className="ficha__foto-enlace ficha__foto relative">
                            <FotoPrenda
                              imagen={producto.imagenes[0]}
                              alt={producto.nombre ?? "Prenda de CGA que ya no está disponible"}
                              sizes={grupo.apaisado ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 45vw"}
                            />
                            <span className="sello-agotado" aria-hidden="true">
                              Agotado
                            </span>
                          </Link>
                          <h4 className="ficha__nombre mt-3 text-base font-bold leading-snug [font-stretch:85%] sm:text-lg">
                            <Link href={`/prenda/${producto.slug}`} className="ficha__enlace">
                              {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
                            </Link>
                          </h4>
                          <p className="mt-1 text-sm text-gris">No vuelve.</p>
                        </article>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-12 text-lg text-gris">Todavía no hay nada que ya no esté.</p>
        )}
      </div>
    </section>
  );
}
