"use client";

import { useActionState } from "react";
import { entrarVisor } from "@/app/admin/visor/acciones";
import { Aviso, BotonEnviar, Campo } from "./ui";

export function FormVisor() {
  const [estado, accion] = useActionState(entrarVisor, null);
  return (
    <form action={accion} className="adm-form" noValidate>
      {estado && !estado.ok ? <Aviso ok={false}>{estado.mensaje}</Aviso> : null}
      <Campo etiqueta="Usuario" nombre="usuario">
        {(p) => <input {...p} type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required className="adm-input" />}
      </Campo>
      <Campo etiqueta="Contraseña" nombre="clave">
        {(p) => <input {...p} type="password" autoComplete="current-password" required className="adm-input" />}
      </Campo>
      <BotonEnviar pendiente="Entrando…">Entrar</BotonEnviar>
    </form>
  );
}
