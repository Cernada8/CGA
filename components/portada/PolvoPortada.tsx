"use client";

import { useEffect, useRef } from "react";
import { EVENTO_PUERTA_ABIERTA } from "@/lib/puerta";
import { CONSULTAS } from "@/lib/motion";

/**
 * Fondo de la portada: polvo de tatami que se levanta al pasar el ratón o el dedo y se posa solo.
 * El motor (WebGL, unos pocos KB) va en un trozo aparte que se pide al montar y arranca nada más hidratar.
 * Con movimiento reducido o sin WebGL no se pinta nada: queda el negro con grano de siempre.
 */
export function PolvoPortada() {
  const ref = useRef<HTMLCanvasElement>(null);
  // Mientras se ve el logo grande de la portada, el pequeño de la cabecera sobra: se oculta (CSS) y vuelve
  // al bajar. html[data-portada-pasada] = la portada ya no se ve.
  useEffect(() => {
    const seccion = ref.current?.parentElement;
    if (!seccion) return;
    const html = document.documentElement;
    const io = new IntersectionObserver(([e]) => html.toggleAttribute("data-portada-pasada", !e.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
      threshold: 0.35,
    });
    io.observe(seccion);
    return () => {
      io.disconnect();
      html.removeAttribute("data-portada-pasada");
    };
  }, []);
  useEffect(() => {
    const canvas = ref.current;
    const seccion = canvas?.parentElement;
    if (!canvas || !seccion || matchMedia(CONSULTAS.reducido).matches) return;
    let parar: (() => void) | undefined;
    let cancelado = false;
    // El motor (3,5 KB) se pide ya, en paralelo con todo lo demás: cuando toque arrancar estará descargado
    const motor = import("./motor-polvo");
    const arrancar = () =>
      motor.then(({ iniciarPolvo }) => {
        if (cancelado || parar) return;
        performance.mark("polvo:arranque"); // medible en DevTools (Rendimiento) y en las pruebas
        try {
          parar = iniciarPolvo(canvas, seccion, { esperarA: EVENTO_PUERTA_ABIERTA });
        } catch {
          // Sin WebGL o con el sombreador rechazado: la portada se queda como estaba
        }
      });
    // Arranca en cuanto la página está hidratada (dos fotogramas de margen para no coincidir con el primer
    // pintado). No espera a la foto ni a que cargue el resto de la página: en un móvil eso eran segundos.
    let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(arrancar)));
    return () => {
      cancelado = true;
      cancelAnimationFrame(raf);
      parar?.();
    };
  }, []);
  return (
    <>
      <canvas ref={ref} className="portada-polvo" aria-hidden="true" />
      {/* Imagen fija del primer fotograma del polvo: se ve desde el primer pintado (sin JS) y se funde con el
          polvo vivo cuando arranca. Con movimiento reducido o sin WebGL se queda: el fondo nunca está vacío. */}
      <div className="portada-poster" aria-hidden="true" />
    </>
  );
}
