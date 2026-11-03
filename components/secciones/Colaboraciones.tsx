import Link from "next/link";
import { Perchero } from "@/components/coleccion/Perchero";
import { Cinta } from "@/components/ui/Cinta";
import { COLECCION } from "@/lib/coleccion";

/**
 * Colaboraciones en la portada: el perchero con las equipaciones hechas con academias es el protagonista
 * (la prueba de lo que hacemos) y debajo, la invitación a hacer la tuya.
 * Aquí la prenda abierta no va en la URL: la portada tiene la puerta del laberinto; los enlaces para compartir
 * una equipación apuntan a /colaboraciones.
 */
export function Colaboraciones() {
  return (
    <section aria-labelledby="colaboraciones" className="grano relative overflow-x-clip border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:pt-24">
        <Cinta id="colaboraciones" entradilla="Equipaciones que hemos hecho con academias. Toca una para verla por delante y por detrás.">
          Colaboraciones
        </Cinta>
      </div>

      {COLECCION.length > 0 ? (
        <div className="mt-10 md:mt-12">
          <Perchero prendas={COLECCION} sincronizarUrl={false} />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:pt-14 lg:pb-24">
        <p className="max-w-2xl text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.05] [font-stretch:85%]">
          ¿Tienes una academia o una marca? Hagamos algo juntos.
        </p>
        <div>
          <p className="max-w-md text-lg text-blanco/85">Equipaciones para tu equipo, ropa para tu academia o un proyecto con tu marca.</p>
          <Link href="/colaboraciones" className="boton-secundario mt-8">
            Hablemos de colaborar
          </Link>
        </div>
      </div>
    </section>
  );
}
