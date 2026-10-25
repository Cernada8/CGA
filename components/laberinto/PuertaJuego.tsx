"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cargarMotor, type Motor } from "@/lib/gsap-cliente";
import { CURVA, DISTANCIA, DURACION } from "@/lib/motion";
import { PruebaGanas } from "./PruebaGanas";
import { PruebaLaberinto } from "./PruebaLaberinto";
import { PruebaLema } from "./PruebaLema";
import { RevelaCGA } from "./RevelaCGA";

export type PropsPrueba = { motor: Motor; reducido: boolean; alSuperar: () => void };

const PRUEBAS = [PruebaLaberinto, PruebaGanas, PruebaLema] as const;

type Props = {
  alSuperar: () => void;
  alRevelar: () => void;
  alTerminar: () => void;
};

/** Secuencia de las tres pruebas. Al superar cada una, su letra se estampa en la barra; al final, revelado C-G-A. */
export function PuertaJuego({ alSuperar, alRevelar, alTerminar }: Props) {
  const [motor, setMotor] = useState<Motor | null>(null);
  const [paso, setPaso] = useState(0);
  const [reducido] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const escena = useRef<HTMLDivElement>(null);
  const ocupado = useRef(false);

  useEffect(() => {
    let vivo = true;
    cargarMotor().then((m) => vivo && setMotor(m));
    return () => {
      vivo = false;
    };
  }, []);

  // Entrada de cada prueba y foco en su título (el lector de pantalla anuncia la prueba nueva)
  useEffect(() => {
    if (!motor) return;
    if (paso >= PRUEBAS.length) {
      alRevelar();
      return;
    }
    ocupado.current = false;
    const el = escena.current;
    if (!el) return;
    el.querySelector<HTMLElement>("[data-foco-inicial]")?.focus({ preventScroll: true });
    if (reducido) return;
    const tween = motor.gsap.fromTo(
      el,
      { y: DISTANCIA.corta, opacity: 0 },
      { y: 0, opacity: 1, duration: DURACION.media, ease: CURVA.entrada, clearProps: "transform,opacity" },
    );
    return () => {
      tween.kill();
    };
  }, [motor, paso, reducido, alRevelar]);

  const superar = useCallback(() => {
    if (ocupado.current || !motor) return;
    ocupado.current = true;
    alSuperar();
    if (reducido) {
      setPaso((p) => p + 1);
      return;
    }
    const { gsap } = motor;
    const letra = document.querySelector(`[data-letra="${paso}"] [aria-hidden]`);
    const tl = gsap.timeline({ onComplete: () => setPaso((p) => p + 1) });
    // La letra se estampa como un sello: entra grande y golpea su sitio
    if (letra) tl.fromTo(letra, { scale: 2.2, rotate: -8 }, { scale: 1, rotate: 0, duration: DURACION.media, ease: CURVA.golpe, clearProps: "transform" }, 0);
    tl.to(escena.current, { y: -DISTANCIA.corta, opacity: 0, duration: 0.35, ease: CURVA.salida }, 0.25);
  }, [motor, paso, reducido, alSuperar]);

  if (!motor) return <p className="puerta__cargando text-gris">Preparando el tatami…</p>;
  if (paso >= PRUEBAS.length) return <RevelaCGA alTerminar={alTerminar} />;

  const Prueba = PRUEBAS[paso];
  return (
    <div ref={escena} className="puerta__prueba">
      <p className="puerta__paso">
        <span className="cinta">
          Prueba {paso + 1} de {PRUEBAS.length}
        </span>
      </p>
      <Prueba key={paso} motor={motor} reducido={reducido} alSuperar={superar} />
    </div>
  );
}
