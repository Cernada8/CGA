"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { cambiarContrasena, confirmarVinculo, entrar, prepararVinculo, verificarCodigo } from "@/app/admin/acceso/acciones";
import { problemasContrasena } from "@/lib/admin/validar";
import { Aviso, BotonEnviar, Campo } from "./ui";

export function FormEntrar() {
  const [estado, accion] = useActionState(entrar, null);
  return (
    <form action={accion} className="adm-form" noValidate>
      {estado && !estado.ok ? <Aviso ok={false}>{estado.mensaje}</Aviso> : null}
      <Campo etiqueta="Correo" nombre="email">
        {(p) => <input {...p} type="email" autoComplete="username" inputMode="email" required className="adm-input" />}
      </Campo>
      <Campo etiqueta="Contraseña" nombre="clave">
        {(p) => <input {...p} type="password" autoComplete="current-password" required className="adm-input" />}
      </Campo>
      <BotonEnviar pendiente="Entrando…">Entrar</BotonEnviar>
    </form>
  );
}

function CampoCodigo() {
  return (
    <Campo etiqueta="Código de 6 números" nombre="codigo" ayuda="Abre Google Authenticator y escribe el código de «CGA Panel».">
      {(p) => (
        <input
          {...p}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className="adm-input adm-input--codigo"
        />
      )}
    </Campo>
  );
}

export function FormCodigo() {
  const [estado, accion] = useActionState(verificarCodigo, null);
  return (
    <form action={accion} className="adm-form" noValidate>
      {estado && !estado.ok ? <Aviso ok={false}>{estado.mensaje}</Aviso> : null}
      <CampoCodigo />
      <BotonEnviar pendiente="Comprobando…">Entrar al panel</BotonEnviar>
    </form>
  );
}

export function FormVincular() {
  const [datos, setDatos] = useState<Awaited<ReturnType<typeof prepararVinculo>> | null>(null);
  const [verSecreto, setVerSecreto] = useState(false);
  const [estado, accion] = useActionState(confirmarVinculo, null);
  const pedido = useRef(false);
  useEffect(() => {
    // Una sola vez: cada llamada genera un QR nuevo y anula el anterior
    if (pedido.current) return;
    pedido.current = true;
    prepararVinculo().then(setDatos);
  }, []);

  if (!datos) return <p className="adm-ayuda">Preparando tu código…</p>;
  if (!datos.ok) return <Aviso ok={false}>{datos.mensaje}</Aviso>;
  return (
    <ol className="adm-pasos">
      <li>
        <strong>Instala Google Authenticator</strong> en tu móvil (gratis en la App Store o en Google Play).
      </li>
      <li>
        <strong>Abre la app, pulsa «+» y escanea este código</strong> con la cámara.
        <div className="adm-qr">
          {/* QR generado por Supabase como imagen SVG en línea */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={datos.qr} alt="Código QR para vincular tu móvil al panel de CGA" width={200} height={200} />
        </div>
        <button type="button" className="adm-enlace-boton" onClick={() => setVerSecreto((v) => !v)}>
          {verSecreto ? "Ocultar la clave" : "¿No puedes escanear? Escríbela a mano"}
        </button>
        {verSecreto ? <code className="adm-secreto">{datos.secreto}</code> : null}
      </li>
      <li>
        <strong>Escribe el código de 6 números</strong> que te aparece en la app.
        <form action={accion} className="adm-form mt-3" noValidate>
          <input type="hidden" name="factorId" value={datos.factorId} />
          {estado && !estado.ok ? <Aviso ok={false}>{estado.mensaje}</Aviso> : null}
          <CampoCodigo />
          <BotonEnviar pendiente="Comprobando…">Vincular mi móvil</BotonEnviar>
        </form>
      </li>
    </ol>
  );
}

export function FormContrasena({ email, textoBoton = "Guardar contraseña" }: { email: string; textoBoton?: string }) {
  const [estado, accion] = useActionState(cambiarContrasena, null);
  const [clave, setClave] = useState("");
  const faltan = problemasContrasena(clave, email);
  const reglas = [
    ["Al menos 12 caracteres.", clave.length >= 12],
    ["Mayúsculas y minúsculas.", /[a-zñ]/.test(clave) && /[A-ZÑ]/.test(clave)],
    ["Algún número.", /\d/.test(clave)],
    ["Sin tu correo, «CGA» ni «password».", clave.length > 0 && !faltan.some((f) => f.startsWith("Que no"))],
  ] as const;
  return (
    <form action={accion} className="adm-form" noValidate>
      {estado ? <Aviso ok={estado.ok}>{estado.mensaje}</Aviso> : null}
      <input type="text" name="usuario" autoComplete="username" value={email} readOnly hidden />
      <Campo etiqueta="Contraseña nueva" nombre="clave" error={estado?.errores?.clave}>
        {(p) => <input {...p} type="password" autoComplete="new-password" required className="adm-input" value={clave} onChange={(e) => setClave(e.target.value)} />}
      </Campo>
      <ul className="adm-reglas" aria-label="Requisitos de la contraseña">
        {reglas.map(([t, cumple]) => (
          <li key={t} data-cumple={cumple || undefined}>
            <span aria-hidden="true">{cumple ? "✓" : "·"}</span> {t}
            <span className="sr-only">{cumple ? " (cumplido)" : " (pendiente)"}</span>
          </li>
        ))}
      </ul>
      <Campo etiqueta="Repite la contraseña" nombre="repetida" error={estado?.errores?.repetida}>
        {(p) => <input {...p} type="password" autoComplete="new-password" required className="adm-input" />}
      </Campo>
      <p className="adm-ayuda">Consejo: usa tres o cuatro palabras que solo tú relaciones, con algún número. Guárdala en el gestor de contraseñas del móvil.</p>
      <BotonEnviar>{textoBoton}</BotonEnviar>
    </form>
  );
}
