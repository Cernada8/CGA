"use client";

import { useEffect, useRef } from "react";
import { EVENTO_PUERTA_ABIERTA } from "@/lib/puerta";
import { CONSULTAS, CURVA_CSS, DURACION, STAGGER } from "@/lib/motion";

/**
 * Entrada de la portada, una sola vez:
 * el logotipo sube 28 px y crece del 96 % al 100 %. Solo transform (nunca parte de opacity 0: es lo primero
 * que se ve y no puede esperar a JavaScript para aparecer).
 * Con la Web Animations API del navegador (sin GSAP): sale en cuanto hidrata, sin esperar a descargar
 * ninguna librería, y la anima el compositor (solo transform), así que va fluida aunque haya carga.
 * El estado inicial lo pone el CSS bajo html.anim (antes de pintar) para que no haya destello;
 * aquí se quita la clase y cada animación arranca desde ese mismo estado (fill: "backwards").
 */
export function AnimarPortada({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const raiz = ref.current;
    const html = document.documentElement;
    if (!raiz) return;
    if (process.env.NEXT_PUBLIC_SIN_ANIMACIONES === "1" || matchMedia(CONSULTAS.reducido).matches || !html.classList.contains("anim")) {
      html.classList.remove("anim");
      return;
    }
    const logo = raiz.querySelector<HTMLElement>('[data-anim="logo"]');
    const despues = [...raiz.querySelectorAll<HTMLElement>('[data-anim="despues"]')];
    const animaciones: Animation[] = [];

    const entrar = () => {
      const ms = (s: number) => s * 1000;
      const comunes = { easing: CURVA_CSS.entrada, fill: "backwards" as const };
      if (logo) {
        animaciones.push(
          logo.animate([{ transform: "translateY(28px) scale(0.96)" }, { transform: "none" }], { ...comunes, duration: ms(DURACION.lenta) * 1.2 }),
        );
      }
      despues.forEach((d, i) => {
        animaciones.push(d.animate([{ opacity: 0 }, { opacity: 1 }], { ...comunes, duration: ms(DURACION.media), delay: ms(DURACION.lenta * 0.6 + i * STAGGER) }));
      });
      // Las animaciones ya tienen su estado inicial: se quita la clase en el mismo fotograma (sin salto)
      html.classList.remove("anim");
    };

    // Con la puerta de entrada cerrada, la portada espera y entra cuando se abre (tras el revelado C-G-A)
    if (html.classList.contains("con-puerta")) {
      window.addEventListener(EVENTO_PUERTA_ABIERTA, entrar, { once: true });
    } else {
      entrar();
    }
    return () => {
      window.removeEventListener(EVENTO_PUERTA_ABIERTA, entrar);
      for (const a of animaciones) a.cancel();
    };
  }, []);
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
