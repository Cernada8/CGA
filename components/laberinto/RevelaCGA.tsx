"use client";

import { useRef } from "react";
import { useAnimacion } from "@/hooks/useAnimacion";
import { splitReveal } from "@/hooks/useSplitReveal";
import { CURVA, DURACION } from "@/lib/motion";

const PALABRAS = ["Constancia", "Ganas", "Actitud"] as const;
/** Separación entre el arranque de cada palabra (s). Revelado completo: 2,4 s. */
const PASO = 0.45;

/**
 * Momento estrella: al salir del laberinto se revelan Constancia, Ganas y Actitud, una a una,
 * letra a letra dentro de máscara con la curva «golpe». El acento del drop solo aparece en un destello final.
 * Con movimiento reducido: entrada estática y fundido de 0,2 s.
 */
export function RevelaCGA({ alTerminar }: { alTerminar: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useAnimacion(ref, (motor, { reducido }, raiz) => {
    const { gsap } = motor;
    const palabras = gsap.utils.toArray<HTMLElement>("[data-revela]", raiz);
    const destello = raiz.querySelector("[data-destello]");

    if (reducido) {
      gsap.set(palabras, { visibility: "visible" });
      gsap.to(raiz, { opacity: 0, duration: DURACION.rapida, delay: 1, onComplete: alTerminar });
      return;
    }

    const tl = gsap.timeline({ onComplete: alTerminar });
    palabras.forEach((el, i) => {
      const { tween } = splitReveal(motor, el, { tipo: "chars", curva: CURVA.golpe, duracion: DURACION.lenta });
      gsap.set(el, { visibility: "visible" });
      tl.add(tween.paused(false), i * PASO);
    });
    tl.fromTo(destello, { opacity: 0 }, { opacity: 1, duration: DURACION.rapida, ease: CURVA.entrada }, 1.7)
      .to(destello, { opacity: 0, duration: DURACION.rapida, ease: CURVA.salida })
      .to(raiz, { opacity: 0, duration: DURACION.rapida, ease: CURVA.salida }, 2.2);
  });

  return (
    <div ref={ref} role="status" aria-label="Constancia, Ganas y Actitud" className="revela fixed inset-0 z-50 grid place-items-center bg-negro">
      <span aria-hidden="true" data-destello className="revela__destello" />
      <p aria-hidden="true" className="relative text-center font-grito leading-[0.95]">
        {PALABRAS.map((p) => (
          <span key={p} data-revela className="revela__palabra block text-[clamp(3.5rem,13vw,9rem)]">
            {p}
          </span>
        ))}
      </p>
    </div>
  );
}
