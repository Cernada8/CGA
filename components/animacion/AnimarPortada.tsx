"use client";

import { useRef } from "react";
import { useAnimacion } from "@/hooks/useAnimacion";
import { CURVA, DISTANCIA, DURACION, STAGGER, staggerSeguro } from "@/lib/motion";

/**
 * Entrada de la portada, una sola vez:
 * 1) las tres palabras suben dentro de su máscara (yPercent 120 → 0),
 * 2) después aparece el resto con opacity,
 * 3) la foto (LCP) solo se desplaza 24 px; nunca parte de opacity 0.
 * El estado inicial lo pone el CSS bajo html.anim (antes de pintar) para que no haya destello;
 * aquí se fija en línea, se quita la clase y se anima.
 */
export function AnimarPortada({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useAnimacion(ref, ({ gsap }, { reducido, movil }, raiz) => {
    const html = document.documentElement;
    const palabras = raiz.querySelectorAll<HTMLElement>('[data-anim="palabra"]');
    const despues = raiz.querySelectorAll<HTMLElement>('[data-anim="despues"]');
    const foto = raiz.querySelector<HTMLElement>('[data-anim="foto"]');

    if (reducido || !html.classList.contains("anim")) {
      html.classList.remove("anim");
      return;
    }

    // y: 0 anula el translate del CSS inicial (GSAP lo leería como y en px)
    gsap.set(palabras, { y: 0, yPercent: 120 });
    gsap.set(despues, { opacity: 0 });
    if (foto) gsap.set(foto, { y: DISTANCIA.corta });
    html.classList.remove("anim");

    // Al terminar se limpian los estilos en línea: el DOM queda igual que sin animación (sin capas extra)
    const tl = gsap.timeline({
      defaults: { ease: CURVA.entrada },
      onComplete: () => gsap.set([...palabras, ...despues, foto].filter(Boolean), { clearProps: "transform,opacity" }),
    });
    tl.to(palabras, {
      yPercent: 0,
      duration: DURACION.lenta,
      stagger: staggerSeguro(palabras.length, movil ? STAGGER / 2 : STAGGER),
    });
    if (foto) tl.to(foto, { y: 0, duration: DURACION.lenta }, 0);
    tl.to(despues, { opacity: 1, duration: DURACION.media, stagger: staggerSeguro(despues.length) }, "-=0.35");
  });
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
