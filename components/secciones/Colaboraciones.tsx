import Image from "next/image";
import Link from "next/link";
import { Cinta } from "@/components/ui/Cinta";
import { FotoPrenda } from "@/components/ui/FotoPrenda";
import { EQUIPACIONES } from "@/lib/catalogo";

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
            className="boton-secundario mt-10"
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
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
        <h3 className="font-sello text-3xl leading-none sm:text-4xl">Equipaciones que ya hemos hecho</h3>
        {/* En móvil la tira se desplaza en horizontal: enfocable para poder moverla con el teclado */}
        <ul className="equipaciones mt-8" aria-label="Equipaciones hechas para academias" tabIndex={0}>
          {EQUIPACIONES.map((e) => (
            <li key={e.slug} className="equipacion overflow-hidden">
              <FotoPrenda imagen={e.foto} alt={e.foto.alt} sizes="(min-width: 1024px) 20vw, 62vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
