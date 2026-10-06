"use client";

import { useEffect, useRef, useState } from "react";
import { cargarMotor } from "@/lib/gsap-cliente";
import { CURVA, DURACION } from "@/lib/motion";

type Partes = { dias: number; horas: number; minutos: number; segundos: number };

function calcular(objetivo: number, ahora: number): Partes {
  const resto = Math.max(0, objetivo - ahora);
  return {
    dias: Math.floor(resto / 86_400_000),
    horas: Math.floor(resto / 3_600_000) % 24,
    minutos: Math.floor(resto / 60_000) % 60,
    segundos: Math.floor(resto / 1000) % 60,
  };
}

const ETIQUETAS: [keyof Partes, string][] = [
  ["dias", "días"],
  ["horas", "horas"],
  ["minutos", "min"],
  ["segundos", "seg"],
];

/** El servidor pinta guiones; el cliente calcula el tiempo (sin error de hidratación). */
export function Reloj({ fechaIso }: { fechaIso: string }) {
  const objetivo = new Date(fechaIso).getTime();
  const [partes, setPartes] = useState<Partes | null>(null);

  useEffect(() => {
    const tick = () => setPartes(calcular(objetivo, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [objetivo]);

  const fechaLegible = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Madrid" }).format(objetivo);

  return (
    <div className="mt-10">
      <p className="sr-only">
        Sale el <time dateTime={fechaIso}>{fechaLegible}</time>.
      </p>
      <dl aria-hidden="true" className="grid max-w-3xl grid-cols-4 gap-3 sm:gap-6">
        {ETIQUETAS.map(([clave, etiqueta]) => (
          <div key={clave} className="flex flex-col-reverse gap-1 border-t-4 border-acento pt-3">
            <dt className="text-sm text-gris">{etiqueta}</dt>
            <dd className="flex text-[clamp(2.25rem,8vw,5.5rem)] font-black leading-none tabular-nums [font-stretch:75%]">
              {(partes ? String(partes[clave]).padStart(2, "0") : "--").split("").map((d, i) => (
                <Digito key={i} valor={d} />
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Un dígito en su máscara: cuando cambia, el nuevo entra desde abajo (duración rápida). Nada se mueve si no cambia. */
function Digito({ valor }: { valor: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const previo = useRef(valor);
  useEffect(() => {
    if (previo.current === valor) return;
    previo.current = valor;
    if (valor === "-" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tween: { kill: () => void } | undefined;
    cargarMotor().then(({ gsap }) => {
      if (ref.current) tween = gsap.fromTo(ref.current, { yPercent: 100 }, { yPercent: 0, duration: DURACION.rapida, ease: CURVA.entrada });
    });
    return () => tween?.kill();
  }, [valor]);
  return (
    <span className="inline-block overflow-hidden">
      <span ref={ref} className="inline-block">
        {valor}
      </span>
    </span>
  );
}
