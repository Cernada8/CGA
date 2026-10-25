"use client";

import { useEffect, useRef, useState } from "react";
import { CURVA, DURACION } from "@/lib/motion";
import type { PropsPrueba } from "./PuertaJuego";

/** Segundos de pulsación continua para escapar */
const S_AGUANTE = 2.2;
/** Fuerza que se pierde por segundo al soltar (no vuelve a cero de golpe: caes y sigues) */
const PERDIDA = 0.22;
/** Cada toque suma esto: quien no pueda mantener pulsado también pasa, a base de toques */
const TOQUE = 0.07;

const RADIO = 46;
const PERIMETRO = 2 * Math.PI * RADIO;

function estado(p: number) {
  if (p >= 1) return "Fuera";
  if (p >= 0.7) return "Ya casi";
  if (p >= 0.3) return "Sigue";
  return "Aguanta";
}

/** G · Ganas: te tienen cogido; aguanta y escapa. */
export function PruebaGanas({ motor, reducido, alSuperar }: PropsPrueba) {
  const [palabra, setPalabra] = useState("Aguanta");
  const [valor, setValor] = useState(0);
  const boton = useRef<HTMLButtonElement>(null);
  const anillo = useRef<SVGCircleElement>(null);
  const cuerpo = useRef<HTMLSpanElement>(null);
  const s = useRef({ p: 0, pulsado: false, hecho: false, ultimo: 0 });

  useEffect(() => {
    let raf = 0;
    let antes = performance.now();
    const paso = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - antes) / 1000);
      antes = ahora;
      const e = s.current;
      if (!e.hecho) {
        // Si un toque ya ha llenado la barra, cuenta aunque se haya soltado antes de este fotograma
        if (e.p < 1) e.p = Math.max(0, Math.min(1, e.p + (e.pulsado ? dt / S_AGUANTE : -dt * PERDIDA)));
        if (anillo.current) anillo.current.style.strokeDashoffset = String(PERIMETRO * (1 - e.p));
        // Temblor del agarre: crece con la fuerza mientras aguantas
        if (cuerpo.current) {
          const t = e.pulsado && !reducido ? e.p * 3 : 0;
          cuerpo.current.style.transform = t ? `translate(${(Math.random() - 0.5) * t}px, ${(Math.random() - 0.5) * t}px)` : "";
        }
        const w = estado(e.p);
        setPalabra((v) => (v === w ? v : w));
        const redondo = Math.round(e.p * 10) * 10;
        if (redondo !== e.ultimo) {
          e.ultimo = redondo;
          setValor(redondo);
        }
        if (e.p >= 1) {
          e.hecho = true;
          e.pulsado = false;
          if (cuerpo.current) cuerpo.current.style.transform = "";
          if (reducido) {
            alSuperar();
          } else {
            motor.gsap
              .timeline({ onComplete: alSuperar })
              .to(boton.current, { scale: 1.12, duration: DURACION.rapida, ease: CURVA.golpe })
              .to(boton.current, { scale: 1, duration: DURACION.media, ease: CURVA.entrada });
          }
          return;
        }
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [motor, reducido, alSuperar]);

  const empezar = () => {
    const e = s.current;
    if (e.hecho) return;
    e.pulsado = true;
    e.p = Math.min(1, e.p + TOQUE);
  };
  const soltar = () => {
    s.current.pulsado = false;
  };

  return (
    <div className="prueba prueba--ganas">
      <div className="prueba__cabeza">
        <h3 tabIndex={-1} data-foco-inicial className="prueba__titulo font-grito">
          Ganas
        </h3>
        <p className="prueba__texto">Te tienen cogido. Mantén pulsado para escapar. Si sueltas, pierdes fuerza.</p>
      </div>

      <div className="agarre">
        <button
          ref={boton}
          type="button"
          className="agarre__boton"
          aria-describedby="agarre-ayuda"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            empezar();
          }}
          onPointerUp={soltar}
          onPointerCancel={soltar}
          onLostPointerCapture={soltar}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              if (!e.repeat || !s.current.pulsado) empezar();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") soltar();
          }}
          onBlur={soltar}
          onContextMenu={(e) => e.preventDefault()}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true" className="agarre__anillo">
            <circle cx="50" cy="50" r={RADIO} className="agarre__pista" />
            <circle
              ref={anillo}
              cx="50"
              cy="50"
              r={RADIO}
              className="agarre__fuerza"
              strokeDasharray={PERIMETRO}
              strokeDashoffset={PERIMETRO}
            />
          </svg>
          <span ref={cuerpo} className="agarre__palabra font-grito" aria-hidden="true">
            {palabra}
          </span>
          <span className="sr-only">Aguanta</span>
        </button>
        <div role="progressbar" aria-label="Fuerza para escapar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor} className="sr-only" />
        <p id="agarre-ayuda" className="agarre__ayuda">
          Mantén pulsado (o la barra espaciadora). También vale a toques rápidos.
        </p>
      </div>
    </div>
  );
}
