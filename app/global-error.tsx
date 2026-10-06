"use client";

import { useEffect } from "react";
import { PaginaError } from "@/components/ui/PaginaError";
import { clasesFuentes } from "@/lib/fuentes";
import "./globals.css";

// Último recurso: falla el propio layout. Sustituye al layout, así que trae su <html>, <body>, estilos y fuentes.
export default function ErrorGlobal({ error, retry, reset }: { error: Error & { digest?: string }; retry?: () => void; reset?: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const reintentar = retry ?? reset;
  return (
    <html lang="es-ES" className={clasesFuentes}>
      <body className="min-h-dvh bg-negro text-blanco antialiased">
        <title>Algo ha fallado · CGA Training Hard</title>
        <PaginaError
          codigo="500"
          titulo="Algo ha fallado"
          texto="La web no ha podido cargar. Vuelve a intentarlo en un momento."
          accion={
            <button
              type="button"
              onClick={() => reintentar?.()}
              className="inline-flex min-h-12 items-center rounded-full bg-acento px-7 font-bold text-sobre-acento [font-stretch:90%] hover:bg-blanco"
            >
              Intentar de nuevo
            </button>
          }
        />
      </body>
    </html>
  );
}
