"use client";

import { dosCifras, useCuentaAtras } from "@/hooks/useCuentaAtras";

/** Cuenta atrás pequeña para las tarjetas del panel. */
export function CuentaPanel({ fechaIso }: { fechaIso: string }) {
  const c = useCuentaAtras(fechaIso);
  if (!c) return <span className="adm-chip">Calculando…</span>;
  if (c.fase === "fuera") return <span className="adm-chip adm-chip--ok">Ya ha salido: está en «Lo nuevo»</span>;
  const p = c.partes;
  return (
    <span className="adm-chip adm-chip--acento" suppressHydrationWarning>
      Faltan {p.dias > 0 ? `${p.dias} d ` : ""}
      {dosCifras(p.horas)} h {dosCifras(p.minutos)} min {dosCifras(p.segundos)} s
    </span>
  );
}
