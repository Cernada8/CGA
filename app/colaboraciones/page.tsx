import type { Metadata } from "next";
import Link from "next/link";
import { Perchero } from "@/components/coleccion/Perchero";
import { Pie } from "@/components/secciones/Pie";
import { Cabecera } from "@/components/ui/Cabecera";
import { COLECCION } from "@/lib/coleccion";
import { EMAIL_CONTACTO, INSTAGRAM_DM_URL } from "@/lib/marca";

export const metadata: Metadata = {
  title: "Colaboraciones",
  description: "Academias, equipos y marcas: equipaciones, ropa para tu academia o un proyecto juntos con CGA Training Hard.",
  alternates: { canonical: "/colaboraciones" },
};

// Esta ruta nunca muestra el laberinto (CLAUDE.md): es la entrada directa para patrocinadores y academias.
export default function PaginaColaboraciones() {
  return (
    <>
      <Cabecera />
      <main id="contenido" className="grano overflow-x-clip">
        <div className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 md:pt-40">
          <h1 className="font-grito text-[clamp(3rem,10vw,6.5rem)] leading-[0.9]">Hagamos algo juntos</h1>
          <div className="mt-10 max-w-prose space-y-5 text-lg text-blanco/90">
            <p>CGA nace en el tatami y vuelve a él. Si tienes una academia, un equipo o una marca, hablemos.</p>
            <p>Hacemos equipaciones para equipos, ropa para academias y proyectos con marcas que entienden lo que es entrenar de verdad.</p>
          </div>
          <dl className="mt-12 grid gap-8 border-t border-gris-oscuro pt-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gris">Por Instagram</dt>
              <dd className="mt-2">
                <a
                  href={INSTAGRAM_DM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center rounded-full bg-acento px-6 font-bold text-sobre-acento [font-stretch:90%] transition-colors duration-300 ease-out hover:bg-blanco"
                >
                  Escríbenos un mensaje
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gris">Por email</dt>
              <dd className="mt-2 text-lg">
                <a
                  href={`mailto:${EMAIL_CONTACTO}?subject=${encodeURIComponent("Colaboración con CGA")}`}
                  className="inline-flex min-h-12 items-center font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento"
                >
                  {EMAIL_CONTACTO}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Perchero: equipaciones hechas con academias. Un enlace con ?prenda=slug abre una directamente. */}
        {COLECCION.length > 0 ? (
          <section aria-labelledby="equipaciones" className="pb-8">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <h2 id="equipaciones" className="font-sello text-3xl leading-none sm:text-4xl">
                Equipaciones que ya hemos hecho
              </h2>
              <p className="mt-4 max-w-prose text-lg text-blanco/85">Toca una para verla de cerca, por delante y por detrás.</p>
            </div>
            {/* El perchero se alinea con el texto de esta página, más estrecho que la portada */}
            <div className="mt-8 md:mt-10" style={{ "--ancho-contenido": "56rem" } as React.CSSProperties}>
              <Perchero prendas={COLECCION} />
            </div>
          </section>
        ) : null}

        <div className="mx-auto max-w-4xl px-4 pt-8 pb-24 sm:px-6">
          <p>
            <Link href="/" className="font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento">
              Ver la web de CGA
            </Link>
          </p>
        </div>
      </main>
      <Pie />
    </>
  );
}
