import Link from "next/link";
import { Cinta } from "@/components/ui/Cinta";

export function Colaboraciones() {
  return (
    <section aria-labelledby="colaboraciones" className="grano border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:py-28">
        <div>
          <Cinta id="colaboraciones">Colaboraciones</Cinta>
          <p className="mt-10 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight [font-stretch:85%]">
            ¿Tienes una academia o una marca? Hagamos algo juntos.
          </p>
          <p className="mt-5 max-w-xl text-lg text-blanco/85">
            Equipaciones para tu equipo, ropa para tu academia o un proyecto con tu marca.
          </p>
        </div>
        <Link
          href="/colaboraciones"
          className="inline-flex min-h-12 items-center rounded-full justify-center bg-blanco px-6 font-bold text-negro [font-stretch:90%] transition-colors duration-300 ease-out hover:bg-acento hover:text-sobre-acento"
        >
          Hablemos de colaborar
        </Link>
      </div>
    </section>
  );
}
