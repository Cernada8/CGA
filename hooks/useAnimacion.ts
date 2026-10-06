"use client";

import { type RefObject, useEffect } from "react";
import { cargarMotor, type Motor } from "@/lib/gsap-cliente";
import { CONSULTAS } from "@/lib/motion";

export type Condiciones = { reducido: boolean; movil: boolean };
export type Montaje = (motor: Motor, condiciones: Condiciones, raiz: HTMLElement) => void | (() => void);

/**
 * Equivalente a useGSAP con GSAP cargado en diferido: crea un gsap.matchMedia() con scope en `scope`
 * y lo revierte al desmontar (animaciones, ScrollTriggers y SplitText incluidos).
 */
export function useAnimacion(scope: RefObject<HTMLElement | null>, montaje: Montaje) {
  useEffect(() => {
    // Interruptor general (útil para medir o ante un problema en producción)
    if (process.env.NEXT_PUBLIC_SIN_ANIMACIONES === "1") return;
    let cancelado = false;
    let revertir: (() => void) | undefined;
    // Se espera también a las fuentes: así SplitText mide bien y todo se crea de forma síncrona dentro del contexto
    Promise.all([cargarMotor(), document.fonts.ready]).then(([motor]) => {
      const raiz = scope.current;
      if (cancelado || !raiz) return;
      const mm = motor.gsap.matchMedia(raiz);
      // «siempre» garantiza que el montaje se ejecute aunque no coincida ninguna otra condición
      mm.add({ siempre: "all", reducido: CONSULTAS.reducido, movil: CONSULTAS.movil }, (ctx) => {
        const c = ctx.conditions as Condiciones;
        return montaje(motor, { reducido: !!c.reducido, movil: !!c.movil }, raiz);
      });
      revertir = () => mm.revert();
    });
    return () => {
      cancelado = true;
      revertir?.();
    };
    // El montaje se define una vez por componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
