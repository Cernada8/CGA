"use client";

import { CURVA, DURACION, STAGGER, staggerSeguro } from "@/lib/motion";
import type { Motor } from "@/lib/gsap-cliente";

type Opciones = { tipo: "chars" | "lines"; curva?: string; duracion?: number };

/**
 * Parte un texto en letras o líneas dentro de máscara (SplitText) y devuelve el tween de yPercent 100 → 0.
* Llamar dentro de useAnimacion (que ya espera a las fuentes), para que el split se revierta con el contexto. aria: "auto" mantiene el texto legible para lectores de pantalla.
 * El llamador decide cuándo revertir (en el onComplete de su timeline).
 */
export function splitReveal({ gsap, SplitText }: Motor, el: HTMLElement, { tipo, curva = CURVA.entrada, duracion = DURACION.lenta }: Opciones) {
  const split = SplitText.create(el, { type: tipo === "chars" ? "words,chars" : "lines", mask: tipo, aria: "auto" });
  const piezas = tipo === "chars" ? split.chars : split.lines;
  // 120 y no 100: los trazos del grafiti sobresalen de su caja y asomarían por la máscara
  const tween = gsap.from(piezas, {
    yPercent: 120,
    duration: duracion,
    ease: curva,
    stagger: staggerSeguro(piezas.length, STAGGER),
    paused: true,
  });
  return { split, tween };
}
