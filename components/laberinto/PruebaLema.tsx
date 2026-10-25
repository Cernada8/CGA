"use client";

import { useEffect, useRef, useState } from "react";
import { CURVA, DURACION } from "@/lib/motion";
import type { PropsPrueba } from "./PuertaJuego";

const CORRECTA = "sumisos";
const OPCIONES = [CORRECTA, "rendidos", "callados", "quietos"] as const;

function barajar<T>(lista: readonly T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A · Actitud: el que es de verdad se sabe el lema. */
export function PruebaLema({ motor, reducido, alSuperar }: PropsPrueba) {
  const [opciones] = useState(() => barajar(OPCIONES));
  const [fallos, setFallos] = useState<string[]>([]);
  const [acierto, setAcierto] = useState(false);
  const frase = useRef<HTMLParagraphElement>(null);
  const hueco = useRef<HTMLSpanElement>(null);

  // Al acertar, la palabra golpea el hueco y se pasa a la siguiente
  useEffect(() => {
    if (!acierto) return;
    if (reducido || !hueco.current) {
      const t = window.setTimeout(alSuperar, 600);
      return () => window.clearTimeout(t);
    }
    const tl = motor.gsap
      .timeline({ onComplete: alSuperar })
      .fromTo(hueco.current, { yPercent: 120 }, { yPercent: 0, duration: DURACION.media, ease: CURVA.golpe })
      .to({}, { duration: 0.45 });
    return () => {
      tl.kill();
    };
  }, [acierto, reducido, motor, alSuperar]);

  const elegir = (o: string) => {
    if (acierto) return;
    if (o === CORRECTA) {
      setAcierto(true);
      return;
    }
    setFallos((f) => [...f, o]);
    if (!reducido && frase.current) {
      motor.gsap.fromTo(frase.current, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)", clearProps: "transform" });
    }
  };

  return (
    <div className="prueba prueba--lema">
      <div className="prueba__cabeza">
        <h3 tabIndex={-1} data-foco-inicial className="prueba__titulo font-grito">
          Actitud
        </h3>
        <p className="prueba__texto">El que es de verdad se sabe el lema. Complétalo.</p>
      </div>

      <p ref={frase} className="lema font-grito" aria-live="polite">
        Siempre humildes, nunca{" "}
        <span className="lema__hueco">
          {acierto ? (
            <span ref={hueco} className="lema__palabra">
              {CORRECTA}.
            </span>
          ) : (
            <>
              <span aria-hidden="true" className="lema__vacio" />
              <span className="sr-only">(hueco)</span>
            </>
          )}
        </span>
      </p>

      <div className="lema__opciones" role="group" aria-label="Elige la palabra que falta">
        {opciones.map((o) => {
          const fallada = fallos.includes(o);
          return (
            <button
              key={o}
              type="button"
              className="lema__opcion"
              data-estado={acierto && o === CORRECTA ? "bien" : fallada ? "mal" : undefined}
              aria-disabled={fallada || acierto}
              onClick={() => !fallada && elegir(o)}
            >
              {o}
            </button>
          );
        })}
      </div>

      <p className="lema__pista" aria-live="polite">
        {fallos.length === 1 ? "No es eso. Vuelve a pensarlo." : null}
        {fallos.length >= 2 ? "Pista: ser tranquilo no es dejarse dominar." : null}
      </p>
    </div>
  );
}
