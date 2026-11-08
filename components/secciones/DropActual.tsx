import Link from "next/link";
import { AnimarTarjetas } from "@/components/animacion/AnimarTarjetas";
import { Cinta } from "@/components/ui/Cinta";
import { FotoPrenda } from "@/components/ui/FotoPrenda";
import { AtajosGrupos, clasesRejilla, TituloGrupo, filasJustificadas } from "@/components/ui/GruposPrendas";
import { agrupar } from "@/lib/categorias";
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
          <GruposNuevo productos={drop.productos} />        ) : (
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

/** Prendas nuevas ordenadas por familias (camisetas, técnicas, sudaderas…), cada familia con su título */
function GruposNuevo({ productos }: { productos: Producto[] }) {
  const grupos = agrupar(productos, (p) => p);
  return (
    <>
      <AtajosGrupos seccion="lo-nuevo" nombreSeccion="Lo nuevo" grupos={grupos.map((g) => g.grupo)} />
      <AnimarTarjetas>
        <div className="grupos-prendas">
          {grupos.map(({ grupo, items }) => {
            const filas = filasJustificadas(items);
            return (
            <div key={grupo.id} className="grupo-prendas">
              {/* Familia: bloque con su título, sin ser otra región (los títulos se repiten en «Lo nuevo» y «Ya no hay») */}
              <TituloGrupo seccion="lo-nuevo" grupo={grupo} />
              <ul className={clasesRejilla(grupo)}>
                {items.map((p) => (
                  <li key={p.id} id={p.slug} data-anim="tarjeta" className="scroll-mt-24" style={filas.get(p.id)}>
                    <FichaProducto producto={p} apaisado={grupo.apaisado} />
                  </li>
                ))}
              </ul>
            </div>
            );
          })}
        </div>
      </AnimarTarjetas>
    </>
  );
}

function FichaProducto({ producto, apaisado }: { producto: Producto; apaisado: boolean }) {
  const imagen = producto.imagenes[0];
  const linea = NOMBRE_LINEA[producto.linea];
  return (
    <article className="ficha">
      <Link href={`/prenda/${producto.slug}`} tabIndex={-1} aria-hidden="true" className="ficha__foto-enlace ficha__foto">
        <div data-anim-escala>
          <FotoPrenda imagen={imagen} alt={producto.nombre ?? "Prenda de CGA"} sizes={apaisado ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"} />
        </div>
      </Link>
      <h4 className="ficha__nombre mt-4 text-lg font-bold leading-snug [font-stretch:85%] sm:text-xl">
        <Link href={`/prenda/${producto.slug}`} className="ficha__enlace">
          {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
        </Link>
      </h4>
      {producto.gramajeG || linea ? (
        <p className="mt-1 text-sm text-gris">{[producto.gramajeG ? `${producto.gramajeG} g` : null, linea].filter(Boolean).join(", ")}</p>
      ) : null}
      {producto.descripcion ? <p className="mt-2 text-base text-blanco/85">{producto.descripcion}</p> : null}
    </article>
  );
}
