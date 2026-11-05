"use client";

import { useEffect, useRef } from "react";
import { EVENTO_PUERTA_ABIERTA } from "@/lib/puerta";
import { CONSULTAS } from "@/lib/motion";

/**
 * Fondo de la portada: polvo de tatami que se levanta al pasar el ratón o el dedo y se posa solo.
 * El motor (WebGL, unos pocos KB) se descarga cuando el navegador está libre: no toca el LCP ni el JS inicial.
 * Con movimiento reducido o sin WebGL no se pinta nada: queda el negro con grano de siempre.
 */
export function PolvoPortada() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const seccion = canvas?.parentElement;
    if (!canvas || !seccion || matchMedia(CONSULTAS.reducido).matches) return;
    let parar: (() => void) | undefined;
    let cancelado = false;
    const arrancar = () =>
      import("./motor-polvo").then(({ iniciarPolvo }) => {
        if (cancelado) return;
        try {
          parar = iniciarPolvo(canvas, seccion, { esperarA: EVENTO_PUERTA_ABIERTA });
        } catch {
          // Sin WebGL o con el sombreador rechazado: la portada se queda como estaba
        }
      });
    // Después de la carga completa (la foto de la portada, que es el LCP, ya está pintada) y con el navegador libre
    // Safari antiguo no tiene requestIdleCallback: plan B con un temporizador corto
    const enReposo = window.requestIdleCallback?.bind(window) ?? ((fn: () => void) => window.setTimeout(fn, 300));
    const cancelar = window.cancelIdleCallback?.bind(window) ?? window.clearTimeout.bind(window);
    let id = 0;
    const cuandoLibre = () => {
      id = enReposo(arrancar, { timeout: 2000 });
    };
    if (document.readyState === "complete") cuandoLibre();
    else addEventListener("load", cuandoLibre, { once: true });
    return () => {
      cancelado = true;
      removeEventListener("load", cuandoLibre);
      cancelar(id);
      parar?.();
    };
  }, []);
  return <canvas ref={ref} className="portada-polvo" aria-hidden="true" />;
}
