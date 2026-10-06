"use client";

import { useState } from "react";

export function Romper() {
  const [roto, setRoto] = useState(false);
  if (roto) throw new Error("Error de prueba");
  return (
    <main className="p-24">
      <button type="button" onClick={() => setRoto(true)} className="rounded-full border-2 border-acento px-5 py-2">
        Provocar un error
      </button>
    </main>
  );
}
