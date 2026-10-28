import { AnimarTarjetas } from "@/components/animacion/AnimarTarjetas";
import { Cinta } from "@/components/ui/Cinta";
import { ALTO_EMBAJADOR, ANCHO_EMBAJADOR, EMBAJADORES, type FotoEmbajador } from "@/lib/embajadores";

const SIZES = "(min-width: 1024px) 25vw, 50vw";

/** Gente que entrena con CGA y la lleva puesta. Retratos grandes, nombre en grafiti, sin adornos. */
export function Embajadores() {
  return (
    <section aria-labelledby="embajadores" className="grano relative border-t border-gris-oscuro bg-negro">
      <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:pt-28 lg:pb-40">
        <Cinta id="embajadores" entradilla="Entrenan duro y la llevan puesta. Dentro y fuera del tatami.">
          Embajadores
        </Cinta>
        <AnimarTarjetas>
          <ul className="embajadores mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {EMBAJADORES.map((e) => (
              <li key={e.slug} data-anim="tarjeta">
                <figure className="embajador">
                  <div data-anim-escala>
                    <Foto foto={e.fotos[0]} />
                    {e.fotos[1] ? <Foto foto={e.fotos[1]} segunda /> : null}
                  </div>
                  <figcaption className="embajador__nombre">{e.nombre}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </AnimarTarjetas>
      </div>
    </section>
  );
}

function Foto({ foto, segunda = false }: { foto: FotoEmbajador; segunda?: boolean }) {
  return (
    // Fotos propias ya optimizadas en dos tamaños
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={foto.rutaPequena}
      srcSet={`${foto.rutaPequena} ${ANCHO_EMBAJADOR / 2}w, ${foto.ruta} ${ANCHO_EMBAJADOR}w`}
      sizes={SIZES}
      width={ANCHO_EMBAJADOR}
      height={ALTO_EMBAJADOR}
      alt={segunda ? "" : foto.alt}
      aria-hidden={segunda || undefined}
      loading="lazy"
      decoding="async"
      className={segunda ? "embajador__segunda" : undefined}
    />
  );
}
