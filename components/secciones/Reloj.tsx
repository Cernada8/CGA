"use client";

import { useEffect, useRef } from "react";
import { dosCifras, type Partes, useCuentaAtras } from "@/hooks/useCuentaAtras";
import { cargarMotor } from "@/lib/gsap-cliente";
import { INSTAGRAM_DM_URL } from "@/lib/marca";
import { CURVA, DURACION } from "@/lib/motion";

const UNIDADES: [keyof Partes, string, string][] = [
  ["dias", "día", "días"],
  ["horas", "hora", "horas"],
  ["minutos", "minuto", "minutos"],
  ["segundos", "segundo", "segundos"],
];

const AVISO_FASE = { lejos: null, horas: "Últimas horas", ultima: "Última hora" } as const;

/**
 * Cuenta atrás grande de «Lo próximo». El servidor pinta guiones; el cliente calcula el tiempo.
 * En las últimas 24 h los números pasan al acento y aparece el aviso; al llegar a cero, «Ya ha salido».
 */
export function Reloj({ fechaIso, fechaLegible }: { fechaIso: string; fechaLegible: string }) {
  const cuenta = useCuentaAtras(fechaIso);

  if (cuenta?.fase === "fuera") {
    return (
      <div className="reloj reloj--fuera" role="status">
        <p className="font-grito text-[clamp(3.5rem,12vw,8rem)] leading-[0.9]">Ya ha salido.</p>
        <p className="mt-6 max-w-md text-lg text-blanco/90">
          <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento">
            Escríbenos por Instagram
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>{" "}
          antes de que se acabe.
        </p>
      </div>
    );
  }

  const aviso = cuenta ? AVISO_FASE[cuenta.fase] : null;
  return (
    <div className="reloj" data-fase={cuenta?.fase ?? "lejos"}>
      <p className="sr-only">
        Sale el <time dateTime={fechaIso}>{fechaLegible}</time>.
      </p>
      {aviso ? (
        <p className="reloj__aviso" aria-live="polite">
          <span aria-hidden="true" className="punto-vivo" />
          {aviso}
        </p>
      ) : null}
      <dl aria-hidden="true" className="reloj__cifras">
        {UNIDADES.map(([clave, singular, plural]) => {
          const valor = cuenta ? dosCifras(cuenta.partes[clave]) : "--";
          return (
            <div key={clave} className="reloj__unidad">
              <dt className="reloj__etiqueta">{cuenta?.partes[clave] === 1 ? singular : plural}</dt>
              <dd className="reloj__numero">
                {valor.split("").map((d, i) => (
                  <Digito key={i} valor={d} />
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** Un dígito en su máscara: cuando cambia, el nuevo entra desde abajo. Nada se mueve si no cambia. */
function Digito({ valor }: { valor: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previo = useRef(valor);
  useEffect(() => {
    if (previo.current === valor) return;
    const venia = previo.current;
    previo.current = valor;
    if (venia === "-" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tween: { kill: () => void } | undefined;
    cargarMotor().then(({ gsap }) => {
      if (ref.current) tween = gsap.fromTo(ref.current, { yPercent: 100 }, { yPercent: 0, duration: DURACION.rapida, ease: CURVA.entrada });
    });
    return () => tween?.kill();
  }, [valor]);
  return (
    <span className="reloj__mascara">
      <span ref={ref} className="inline-block">
        {valor}
      </span>
    </span>
  );
}
