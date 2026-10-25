import Link from "next/link";
import { BotonInstagram } from "./BotonInstagram";
import { Insignia, MarcaTexto } from "./Logo";

/** Cabecera fija con el CTA de Instagram siempre visible, también en móvil.
 *  `centro`: hueco central opcional (desde 1024 px), p. ej. el recordatorio de la próxima prenda. */
export function Cabecera({ centro }: { centro?: React.ReactNode } = {}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-gris-oscuro/60 bg-negro/85 backdrop-blur-sm">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {centro ? <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">{centro}</div> : null}
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="CGA Training Hard, inicio"
        >
          <Insignia tamano={44} alt="" prioridad />
          <span className="hidden text-blanco sm:block">
            <MarcaTexto variante="horizontal" ancho={60} />
          </span>
        </Link>
        <BotonInstagram direccion="abajo" className="boton-ig--cabecera" />
      </div>
    </header>
  );
}
