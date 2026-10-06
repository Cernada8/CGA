"use client";

import { useRef } from "react";
import { useAnimacion } from "@/hooks/useAnimacion";
import { CURVA, DISTANCIA, DURACION, staggerSeguro } from "@/lib/motion";

/**
 * Tarjetas que entran en lotes al hacer scroll (ScrollTrigger.batch, una vez).
 * Escritorio: la foto sube dentro de su máscara con una escala sutil (1,04 → 1) y el texto aparece después.
 * Móvil: solo y + opacity. Todo con transform y opacity.
 */
export function AnimarTarjetas({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useAnimacion(ref, ({ gsap, ScrollTrigger }, { reducido, movil }, raiz) => {
    const tarjetas = gsap.utils.toArray<HTMLElement>("[data-anim='tarjeta']", raiz);
    if (!tarjetas.length) return;
    const foto = (t: Element) => t.querySelector("[data-anim-escala]");
    const textos = (t: Element) => t.querySelectorAll(".ficha > :not(.ficha__foto)");

    // Movimiento reducido: nada se oculta ni se mueve
    if (reducido) return;
    if (movil) {
      gsap.set(tarjetas, { y: DISTANCIA.corta, opacity: 0 });
    } else {
      gsap.set(tarjetas.map(foto), { yPercent: 100, scale: 1.04 });
      gsap.set(tarjetas.flatMap((t) => [...textos(t)]), { y: DISTANCIA.corta, opacity: 0 });
    }

    ScrollTrigger.batch(tarjetas, {
      start: "top 88%",
      once: true,
      onEnter: (lote) => {
        const cada = staggerSeguro(lote.length);
        if (movil) {
          gsap.to(lote, { y: 0, opacity: 1, duration: DURACION.media, ease: CURVA.entrada, stagger: cada, clearProps: "transform,opacity" });
          return;
        }
        gsap.to(lote.map(foto), { yPercent: 0, scale: 1, duration: DURACION.lenta, ease: CURVA.entrada, stagger: cada, clearProps: "transform" });
        gsap.to(
          lote.map((t) => [...textos(t)]),
          { y: 0, opacity: 1, duration: DURACION.media, ease: CURVA.entrada, stagger: cada, delay: 0.25, clearProps: "transform,opacity" },
        );
      },
    });
  });
  return <div ref={ref}>{children}</div>;
}
