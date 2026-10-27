"use client";

import { useActionState, useState } from "react";
import { borrarLanzamiento, guardarLanzamiento } from "@/app/admin/acciones";
import { ACENTOS } from "@/lib/admin/validar";
import { Aviso, BotonEnviar, Campo } from "./ui";

type Valores = {
  id?: string;
  nombre: string;
  estado: "proximo" | "activo" | "agotado";
  fecha: string;
  hora: string;
  acento: string;
  publicado: boolean;
};

const DONDE = [
  { valor: "proximo", titulo: "Lo próximo", texto: "Sale más adelante. En la web aparece la cuenta atrás y sus prendas no se ven hasta ese día." },
  { valor: "activo", titulo: "Lo nuevo", texto: "Ya ha salido. Sus prendas se ven en la web ahora mismo." },
  { valor: "agotado", titulo: "Ya no hay", texto: "Se acabó. Sus prendas salen en «Ya no hay» con el sello de agotado." },
] as const;

export function FormLanzamiento({ valores }: { valores: Valores }) {
  const [estado, accion] = useActionState(guardarLanzamiento, null);
  const [donde, setDonde] = useState(valores.estado);
  const preset = ACENTOS.some((a) => a.valor === valores.acento);
  const [acento, setAcento] = useState(preset ? valores.acento : "otro");
  const [propio, setPropio] = useState(preset ? "#a39c84" : valores.acento);
  const e = estado?.errores ?? {};

  return (
    <form action={accion} className="adm-form adm-form--ancho" noValidate>
      {estado ? <Aviso ok={estado.ok}>{estado.mensaje}</Aviso> : null}
      {valores.id ? <input type="hidden" name="id" value={valores.id} /> : null}

      <Campo etiqueta="Nombre del lanzamiento" nombre="nombre" ayuda="Solo lo ves tú, para reconocerlo. En la web no se nombra." error={e.nombre}>
        {(p) => <input {...p} defaultValue={valores.nombre} maxLength={80} required className="adm-input" placeholder="Por ejemplo: Sudadera de invierno" />}
      </Campo>

      <fieldset className="adm-campo">
        <legend className="adm-etiqueta">¿Dónde aparece en la web?</legend>
        <div className="adm-opciones">
          {DONDE.map((d) => (
            <label key={d.valor} className="adm-opcion" data-activa={donde === d.valor || undefined}>
              <input type="radio" name="estado" value={d.valor} checked={donde === d.valor} onChange={() => setDonde(d.valor)} />
              <span className="adm-opcion__titulo">{d.titulo}</span>
              <span className="adm-opcion__texto">{d.texto}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {donde === "proximo" ? (
        <fieldset className="adm-campo">
          <legend className="adm-etiqueta">¿Cuándo sale? (hora de España)</legend>
          <p className="adm-ayuda">A esa hora exacta la cuenta atrás llega a cero y sus prendas aparecen en «Lo nuevo» solas.</p>
          <div className="adm-fila">
            <label className="adm-mini-campo">
              <span>Día</span>
              <input type="date" name="fecha" defaultValue={valores.fecha} required className="adm-input" aria-invalid={e.fecha ? true : undefined} />
            </label>
            <label className="adm-mini-campo">
              <span>Hora</span>
              <input type="time" name="hora" defaultValue={valores.hora} required className="adm-input" />
            </label>
          </div>
          {e.fecha ? <p className="adm-error">{e.fecha}</p> : null}
        </fieldset>
      ) : null}

      <fieldset className="adm-campo">
        <legend className="adm-etiqueta">Color del lanzamiento</legend>
        <p className="adm-ayuda">Se usa en los botones y detalles de la web mientras esté activo. Solo uno a la vez.</p>
        <div className="adm-colores">
          {ACENTOS.map((a) => (
            <label key={a.valor} className="adm-color" data-activa={acento === a.valor || undefined}>
              <input type="radio" name="acento" value={a.valor} checked={acento === a.valor} onChange={() => setAcento(a.valor)} />
              <span className="adm-muestra" style={{ background: a.valor }} aria-hidden="true" />
              {a.texto}
            </label>
          ))}
          <label className="adm-color" data-activa={acento === "otro" || undefined}>
            <input type="radio" name="acento" value="otro" checked={acento === "otro"} onChange={() => setAcento("otro")} />
            <input type="color" name="acentoPropio" value={propio} onChange={(ev) => setPropio(ev.target.value)} aria-label="Elige otro color" className="adm-selector-color" />
            Otro
          </label>
        </div>
        {e.acento ? <p className="adm-error">{e.acento}</p> : null}
      </fieldset>

      <label className="adm-interruptor">
        <input type="checkbox" name="publicado" defaultChecked={valores.publicado} />
        <span>
          <strong>Visible en la web</strong>
          <span className="adm-ayuda block">Si lo desmarcas, el lanzamiento y sus prendas desaparecen de la web (no se borran).</span>
        </span>
      </label>

      <BotonEnviar>{valores.id ? "Guardar cambios" : "Crear lanzamiento"}</BotonEnviar>
    </form>
  );
}

export function BorrarLanzamiento({ id, prendas }: { id: string; prendas: number }) {
  const [estado, accion] = useActionState(borrarLanzamiento, null);
  return (
    <details className="adm-peligro">
      <summary>Borrar este lanzamiento</summary>
      <form action={accion} className="adm-form">
        <p className="adm-texto">
          Se borrará el lanzamiento{prendas ? ` y sus ${prendas} prendas con todas sus fotos` : ""}. <strong>No se puede deshacer.</strong>
        </p>
        {estado && !estado.ok ? <Aviso ok={false}>{estado.mensaje}</Aviso> : null}
        <input type="hidden" name="id" value={id} />
        <Campo etiqueta="Para confirmar, escribe BORRAR" nombre="confirmar">
          {(p) => <input {...p} autoComplete="off" className="adm-input" />}
        </Campo>
        <BotonEnviar variante="peligro" pendiente="Borrando…">
          Borrar para siempre
        </BotonEnviar>
      </form>
    </details>
  );
}
