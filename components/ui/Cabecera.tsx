import Link from "next/link";
import { BotonInstagram } from "./BotonInstagram";
import { MarcaTexto } from "./Logo";
import { MenuMovil, NavEscritorio } from "./MenuSecciones";

/** Cabecera fija con el CTA de Instagram siempre visible, también en móvil.
 *  `centro`: hueco central opcional (desde 1024 px), p. ej. el recordatorio de la próxima prenda; si no lo hay,
 *  ahí van los atajos a las secciones. En el móvil, los atajos van en el menú. */
export function Cabecera({ centro }: { centro?: React.ReactNode } = {}) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-gris-oscuro/60 bg-negro/85 backdrop-blur-sm">
      {/* Lo primero al tabular: saltar la cabecera e ir directo al contenido (solo se ve con el foco) */}
      <a href="#contenido" className="saltar">
        Saltar al contenido
      </a>
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {centro ? <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">{centro}</div> : null}
        <Link
          href="/"
          className="cabecera-logo flex min-h-11 items-center"
          aria-label="CGA Training Hard, inicio"
        >
          {/* Solo el logotipo de texto (CGA Training Hard), en móvil y en escritorio */}
          <span className="block text-blanco">
            <MarcaTexto variante="horizontal" ancho={60} />
          </span>
        </Link>
        {centro ? null : <NavEscritorio />}
        <div className="flex items-center gap-2">
          <MenuMovil />
          <BotonInstagram direccion="abajo" className="boton-ig--cabecera" />
        </div>
      </div>
    </header>
  );
}
