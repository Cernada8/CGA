"use client";

import { useEffect, useState } from "react";

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
            <dd className="text-[clamp(2.25rem,8vw,5.5rem)] font-black leading-none tabular-nums [font-stretch:75%]">
              {partes ? String(partes[clave]).padStart(2, "0") : "--"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
