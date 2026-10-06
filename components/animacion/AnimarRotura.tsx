"use client";

import { useRef } from "react";
import { useAnimacion } from "@/hooks/useAnimacion";
import { CURVA, DURACION } from "@/lib/motion";

/**
 * El gorila rompe la pared al entrar en pantalla (una vez): el hueco y las grietas se abren desde el
 * centro, el gorila sale y saltan los escombros. Solo escala y opacity de capas completas.
 */
export function AnimarRotura({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useAnimacion(ref, ({ gsap }, { reducido }, raiz) => {
    const pared = raiz.querySelector(".rotura__pared");
    const gorila = raiz.querySelector(".rotura__gorila");
    const escombros = gsap.utils.toArray<SVGSVGElement>(".rotura__capa-escombros", raiz);
    const capas = [pared, gorila, ...escombros].filter(Boolean) as Element[];
    const st = { trigger: raiz, start: "top 75%", once: true };
    // Movimiento reducido: nada se oculta ni se mueve
    if (reducido) return;
    // Se animan capas completas (nunca trazos sueltos del SVG): así el compositor mueve bitmaps ya pintados
    gsap.set(capas, { willChange: "transform, opacity" });
    const tl = gsap.timeline({
      scrollTrigger: st,
      defaults: { ease: CURVA.entrada, transformOrigin: "50% 50%" },
      onComplete: () => gsap.set(capas, { clearProps: "transform,opacity,willChange" }),
    });
    tl.from(pared, { scale: 0.6, opacity: 0, duration: DURACION.lenta })
      .from(gorila, { scale: 0.85, opacity: 0, duration: DURACION.lenta }, 0.1)
      .from(escombros, { scale: 0.7, opacity: 0, duration: DURACION.media, stagger: 0.06 }, 0.2);
  });
  return <div ref={ref}>{children}</div>;
}
