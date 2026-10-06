"use client";

import { useRef } from "react";
import { useAnimacion } from "@/hooks/useAnimacion";

/** La cinta del lema solo se desliza cuando la persona hace scroll (scrub), unos 120 px. Quieta si no hay scroll. */
export function AnimarCinta({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useAnimacion(ref, ({ gsap }, { reducido }, raiz) => {
    if (reducido) return;
    const pista = raiz.querySelector(".cinta-lema__pista");
    if (!pista) return;
    // scrub (sin once): el movimiento está ligado al scroll en ambas direcciones, nunca en bucle
    gsap.fromTo(pista, { x: 0 }, { x: -120, ease: "none", scrollTrigger: { trigger: raiz, start: "top bottom", end: "bottom top", scrub: true } });
  });
  return <div ref={ref}>{children}</div>;
}
