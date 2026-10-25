"use client";

import { useEffect, useState } from "react";

export type Partes = { dias: number; horas: number; minutos: number; segundos: number };
/** lejos: más de 24 h · horas: últimas 24 h · ultima: última hora · fuera: ya ha salido */
export type Fase = "lejos" | "horas" | "ultima" | "fuera";
export type Cuenta = { partes: Partes; fase: Fase; resto: number };

const H = 3_600_000;

export function calcular(objetivo: number, ahora: number): Cuenta {
  const resto = Math.max(0, objetivo - ahora);
  return {
    resto,
    fase: resto === 0 ? "fuera" : resto <= H ? "ultima" : resto <= 24 * H ? "horas" : "lejos",
    partes: {
      dias: Math.floor(resto / 86_400_000),
      horas: Math.floor(resto / H) % 24,
      minutos: Math.floor(resto / 60_000) % 60,
      segundos: Math.floor(resto / 1000) % 60,
    },
  };
}

/**
 * Cuenta atrás hasta `fechaIso`. Devuelve null en el servidor y en el primer render (sin error de hidratación);
 * después se actualiza cada segundo, alineado con el cambio de segundo del reloj.
 */
export function useCuentaAtras(fechaIso: string): Cuenta | null {
  const objetivo = new Date(fechaIso).getTime();
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  useEffect(() => {
    let id = 0;
    const tick = () => {
      const ahora = Date.now();
      const c = calcular(objetivo, ahora);
      setCuenta(c);
      if (c.fase !== "fuera") id = window.setTimeout(tick, 1000 - (ahora % 1000) + 5);
    };
    tick();
    return () => window.clearTimeout(id);
  }, [objetivo]);
  return cuenta;
}

export const dosCifras = (n: number) => String(n).padStart(2, "0");
