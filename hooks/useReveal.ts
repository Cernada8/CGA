"use client";

import type { RefObject } from "react";
import { CURVA, DISTANCIA, DURACION } from "@/lib/motion";
import { useAnimacion } from "./useAnimacion";

type Opciones = { selector?: string; clip?: boolean; escala?: number };

/** Revela un elemento al entrar en pantalla, una sola vez. Con movimiento reducido no se anima nada. */
export function useReveal(scope: RefObject<HTMLElement | null>, { selector, clip = false, escala }: Opciones = {}) {
  useAnimacion(scope, ({ gsap }, { reducido, movil }, raiz) => {
    const objetivo = selector ? raiz.querySelector<HTMLElement>(selector) : raiz;
    if (!objetivo) return;
    const st = { trigger: raiz, start: "top 85%", once: true };
    // Movimiento reducido: nada se oculta ni se mueve
    if (reducido) return;
    const tl = gsap.timeline({
      scrollTrigger: st,
      defaults: { ease: CURVA.entrada },
      onComplete: () => gsap.set([objetivo, objetivo.querySelector("[data-anim-escala]")].filter(Boolean), { clearProps: "transform,opacity" }),
    });
    if (clip && !movil) {
      // «Telón» solo con transform: el bloque sube dentro de la máscara del contenedor (overflow: clip).
      // Equivale a un clip-path de abajo arriba sin repintar en cada fotograma.
      tl.from(objetivo, { yPercent: 100, duration: DURACION.lenta });
    } else {
      tl.from(objetivo, { y: DISTANCIA.corta, opacity: 0, duration: DURACION.media });
    }
    // En móvil sin escala: mover capas con imágenes grandes cuesta fotogramas en un Android medio
    if (escala && !movil) {
      const interior = objetivo.querySelector<HTMLElement>("[data-anim-escala]") ?? objetivo;
      tl.from(interior, { scale: escala, duration: DURACION.lenta }, 0);
    }
  });
}
