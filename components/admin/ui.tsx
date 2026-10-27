"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** Botón de envío que se bloquea y avisa mientras guarda (evita dobles envíos). */
export function BotonEnviar({ children, pendiente = "Guardando…", variante = "principal", className = "" }: { children: ReactNode; pendiente?: string; variante?: "principal" | "secundario" | "peligro"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`adm-boton adm-boton--${variante} ${className}`}>
      {pending ? pendiente : children}
    </button>
  );
}

/** Mensaje tras guardar: verde si ha ido bien, rojo si no. Se anuncia a lectores de pantalla. */
export function Aviso({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p role={ok ? "status" : "alert"} className={`adm-aviso ${ok ? "adm-aviso--ok" : "adm-aviso--error"}`}>
      {children}
    </p>
  );
}

type CampoProps = {
  etiqueta: string;
  nombre: string;
  ayuda?: ReactNode;
  error?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; name: string }) => ReactNode;
};

/** Campo con etiqueta, ayuda y error enlazados (accesible y claro). */
export function Campo({ etiqueta, nombre, ayuda, error, children }: CampoProps) {
  const id = `campo-${nombre}`;
  const describe = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="adm-campo">
      <label htmlFor={id} className="adm-etiqueta">
        {etiqueta}
      </label>
      {ayuda ? (
        <p id={`${id}-ayuda`} className="adm-ayuda">
          {ayuda}
        </p>
      ) : null}
      {children({ id, "aria-describedby": describe, "aria-invalid": error ? true : undefined, name: nombre })}
      {error ? (
        <p id={`${id}-error`} className="adm-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
