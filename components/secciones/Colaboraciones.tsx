import Image from "next/image";
import Link from "next/link";
import { Cinta } from "@/components/ui/Cinta";

export function Colaboraciones() {
  return (
    <section aria-labelledby="colaboraciones" className="grano relative overflow-hidden border-t border-gris-oscuro bg-carbon">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div className="relative z-10">
          <Cinta id="colaboraciones">Colaboraciones</Cinta>
          <p className="mt-10 max-w-xl text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.05] [font-stretch:85%]">
            ¿Tienes una academia o una marca? Hagamos algo juntos.
          </p>
          <p className="mt-6 max-w-md text-lg text-blanco/85">
            Equipaciones para tu equipo, ropa para tu academia o un proyecto con tu marca.
          </p>
          <Link
            href="/colaboraciones"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-blanco px-7 font-bold text-negro [font-stretch:90%] transition-colors duration-300 ease-out hover:bg-acento hover:text-sobre-acento"
          >
            Hablemos de colaborar
          </Link>
        </div>
        <div className="colab-foto relative hidden lg:block">
          <Image
            src="/hero/cga-luchadores.webp"
            alt="Dos luchadores con ropa de CGA entre una nube de polvo"
            width={1122}
            height={1402}
            sizes="(min-width: 1024px) 520px, 90vw"
            className="mx-auto h-auto w-full max-w-[520px]"
          />
        </div>
      </div>
    </section>
  );
}
