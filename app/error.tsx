"use client";

import { useEffect } from "react";
import { PaginaError } from "@/components/ui/PaginaError";

// Error inesperado en cualquier página (500). El layout, la cabecera y las fuentes siguen cargados.
export default function ErrorPagina({ error, retry, reset }: { error: Error & { digest?: string }; retry?: () => void; reset?: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const reintentar = retry ?? reset;
  return (
    <>
      <title>Algo ha fallado · CGA Training Hard</title>
      <PaginaError
        codigo="500"
        titulo="Algo ha fallado"
        texto="No es culpa tuya. Caes, te levantas y vuelves a intentarlo."
        accion={
          <button
            type="button"
            onClick={() => reintentar?.()}
            className="inline-flex min-h-12 items-center rounded-full bg-acento px-7 font-bold text-sobre-acento [font-stretch:90%] transition-colors duration-[var(--mov-rapida)] ease-[var(--mov-transicion)] hover:bg-blanco"
          >
            Intentar de nuevo
          </button>
        }
      />
    </>
  );
}
