"use client";

import { useState } from "react";
import { RevelaCGA } from "@/components/laberinto/RevelaCGA";
import { Reloj } from "@/components/secciones/Reloj";

export function PruebaRevelado() {
  const [vuelta, setVuelta] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fecha] = useState(() => new Date(Date.now() + 86_400_000 * 3 + 5000).toISOString());
  return (
    <main className="mx-auto max-w-4xl px-4 py-24">
      <h1 className="text-2xl font-bold">Pruebas de animación</h1>
      <button
        type="button"
        className="mt-6 rounded-full border-2 border-acento px-5 py-2"
        onClick={() => {
          setVisible(true);
          setVuelta((v) => v + 1);
        }}
      >
        Repetir revelado
      </button>
      <Reloj fechaIso={fecha} />
      {visible ? <RevelaCGA key={vuelta} alTerminar={() => setVisible(false)} /> : null}
    </main>
  );
}
