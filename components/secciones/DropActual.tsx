import { Cinta } from "@/components/ui/Cinta";
import { FotoPendiente } from "@/components/ui/FotoPendiente";
import type { Drop, Producto } from "@/lib/drops";
import { INSTAGRAM_DM_URL } from "@/lib/marca";

const NOMBRE_LINEA: Record<Producto["linea"], string | null> = {
  general: null,
  woman: "CGA Woman",
  kids: "CGA Kids",
};

export function DropActual({ drop }: { drop: Drop | null }) {
  return (
    <section aria-labelledby="lo-nuevo" className="scroll-mt-20 border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Cinta id="lo-nuevo">Lo nuevo</Cinta>
          <p className="max-w-sm text-lg text-blanco/90">Cada prenda sale una vez. Cuando se acaba, se acaba.</p>
        </div>

        {drop && drop.productos.length > 0 ? (
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {drop.productos.map((p) => (
              <li key={p.id}>
                <FichaProducto producto={p} />
              </li>
            ))}
          </ul>
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
    <article>
      <FotoPendiente alt={imagen?.alt ?? producto.nombre ?? "Prenda de CGA"} />
      <h3 className="mt-4 text-lg font-bold leading-snug [font-stretch:85%] sm:text-xl">
        {producto.nombre ?? <span className="pendiente">[NOMBRE PRENDA]</span>}
      </h3>
      {producto.gramajeG || linea ? (
        <p className="mt-1 text-sm text-gris">{[producto.gramajeG ? `${producto.gramajeG} g` : null, linea].filter(Boolean).join(", ")}</p>
      ) : null}
      {producto.descripcion ? <p className="mt-2 text-base text-blanco/85">{producto.descripcion}</p> : null}
    </article>
  );
}
