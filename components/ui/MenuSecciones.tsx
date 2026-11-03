"use client";

import { useRef } from "react";

// Atajos a las secciones de la portada. En escritorio van en la cabecera; en el móvil, en un menú a pantalla
// completa con objetivos grandes (la portada es larga y sin esto solo queda hacer scroll).
// Los enlaces son /#seccion: desde otras páginas llevan a la portada y a esa sección.
export const SECCIONES = [
  { id: "lo-nuevo", nombre: "Lo nuevo", escritorio: true },
  { id: "colaboraciones", nombre: "Colaboraciones", escritorio: true },
  { id: "ya-no-hay", nombre: "Ya no hay", escritorio: true },
  { id: "historia", nombre: "De dónde venimos", escritorio: false },
  { id: "embajadores", nombre: "Embajadores", escritorio: false },
  { id: "como-conseguirlo", nombre: "Cómo conseguirlo", escritorio: true },
] as const;

export function NavEscritorio() {
  return (
    <nav aria-label="Secciones" className="hidden lg:block">
      <ul className="nav-cabecera">
        {SECCIONES.filter((s) => s.escritorio).map((s) => (
          <li key={s.id}>
            <a href={`/#${s.id}`}>{s.nombre}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MenuMovil() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  function abrir() {
    dialogo.current?.showModal();
    document.documentElement.classList.add("sin-scroll");
  }
  function cerrar() {
    dialogo.current?.close();
  }

  return (
    <>
      <button ref={boton} type="button" className="menu-boton lg:hidden" aria-haspopup="dialog" onClick={abrir}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M4 8h16M4 16h16" />
        </svg>
        <span className="sr-only">Menú</span>
      </button>
      <dialog
        ref={dialogo}
        className="menu-movil"
        aria-label="Menú"
        onClose={() => document.documentElement.classList.remove("sin-scroll")}
        onClick={(e) => e.target === e.currentTarget && cerrar()}
      >
        <div className="menu-movil__panel">
          <button type="button" className="menu-movil__cerrar" onClick={cerrar}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            <span className="sr-only">Cerrar el menú</span>
          </button>
          <nav aria-label="Secciones">
            <ul className="menu-movil__lista">
              {SECCIONES.map((s) => (
                <li key={s.id}>
                  {/* Se cierra al pulsar y el navegador baja a la sección */}
                  <a href={`/#${s.id}`} onClick={cerrar}>
                    {s.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  );
}
