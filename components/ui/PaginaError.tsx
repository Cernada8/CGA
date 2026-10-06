import Link from "next/link";
import { INSTAGRAM_URL } from "@/lib/marca";
import { Cabecera } from "./Cabecera";

type Props = {
  codigo: string;
  titulo: string;
  texto: string;
  /** Acción principal propia (p. ej. «Intentar de nuevo»); si no hay, la principal es volver al inicio. */
  accion?: React.ReactNode;
};

/** Plantilla común de las páginas de error: código enorme en gótica, titular en grafiti y salidas claras. */
export function PaginaError({ codigo, titulo, texto, accion }: Props) {
  return (
    <>
      <Cabecera />
      <main
        id="contenido"
        className="grano relative grid min-h-dvh place-items-center overflow-hidden px-4 py-24"
      >
        <span aria-hidden="true" className="pagina-error__codigo">
          {codigo}
        </span>
        <div className="relative max-w-xl text-center">
          <p className="font-sello text-2xl text-acento">Error {codigo}</p>
          <h1 className="mt-3 font-grito text-[clamp(3rem,12vw,6.5rem)] leading-[0.9]">
            {titulo}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-blanco/90 sm:text-xl">
            {texto}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            {accion ?? (
              <Link
                href="/"
                className="inline-flex min-h-12 items-center rounded-full bg-acento px-7 font-bold text-sobre-acento [font-stretch:90%] transition-colors duration-[var(--mov-rapida)] ease-[var(--mov-transicion)] hover:bg-blanco"
              >
                Volver al inicio
              </Link>
            )}
            {accion ? (
              <Link
                href="/"
                className="font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento"
              >
                Volver al inicio
              </Link>
            ) : (
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento"
              >
                Ver @cga.training.hard
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
