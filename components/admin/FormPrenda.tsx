"use client";

import { useActionState, useRef, useState } from "react";
import { borrarFoto, borrarPrenda, guardarPrenda, moverFoto, subirFoto } from "@/app/admin/acciones";
import type { FotoAdmin } from "@/lib/admin/datos";
import { CATEGORIAS, LINEAS } from "@/lib/admin/validar";
import { Aviso, BotonEnviar, Campo } from "./ui";

export type OpcionLanzamiento = { id: string; texto: string; grupo: string };

type Valores = {
  id?: string;
  drop_id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  gramaje: string;
  linea: string;
  agotado: boolean;
  publicado: boolean;
};

export function FormPrenda({ valores, lanzamientos }: { valores: Valores; lanzamientos: OpcionLanzamiento[] }) {
  const [estado, accion] = useActionState(guardarPrenda, null);
  const [descripcion, setDescripcion] = useState(valores.descripcion);
  const e = estado?.errores ?? {};
  const grupos = [...new Set(lanzamientos.map((l) => l.grupo))];

  return (
    <form action={accion} className="adm-form adm-form--ancho" noValidate>
      {estado ? <Aviso ok={estado.ok}>{estado.mensaje}</Aviso> : null}
      {valores.id ? <input type="hidden" name="id" value={valores.id} /> : null}

      <Campo etiqueta="Nombre de la prenda" nombre="nombre" ayuda="Tal cual saldrá en la web." error={e.nombre}>
        {(p) => <input {...p} defaultValue={valores.nombre} maxLength={80} required className="adm-input" placeholder="Por ejemplo: Sudadera oversize gorila" />}
      </Campo>

      <Campo etiqueta="¿Dónde va?" nombre="drop_id" ayuda="El lanzamiento decide si sale en «Lo próximo», «Lo nuevo» o «Ya no hay»." error={e.drop_id}>
        {(p) => (
          <select {...p} defaultValue={valores.drop_id} required className="adm-input">
            <option value="" disabled>
              Elige…
            </option>
            {grupos.map((g) => (
              <optgroup key={g} label={g}>
                {lanzamientos
                  .filter((l) => l.grupo === g)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.texto}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        )}
      </Campo>

      <div className="adm-fila">
        <Campo etiqueta="Tipo de prenda" nombre="categoria">
          {(p) => (
            <select {...p} defaultValue={valores.categoria || "Camiseta"} className="adm-input">
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="Línea" nombre="linea">
          {(p) => (
            <select {...p} defaultValue={valores.linea || "general"} className="adm-input">
              {LINEAS.map((l) => (
                <option key={l.valor} value={l.valor}>
                  {l.texto}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="Gramaje (opcional)" nombre="gramaje" ayuda="En gramos. Por ejemplo, 350." error={e.gramaje}>
          {(p) => <input {...p} defaultValue={valores.gramaje} inputMode="numeric" pattern="[0-9]*" maxLength={4} className="adm-input" />}
        </Campo>
      </div>

      <Campo etiqueta="Descripción (opcional)" nombre="descripcion" ayuda={`Frases cortas, como en la web. ${descripcion.length}/400`}>
        {(p) => <textarea {...p} value={descripcion} onChange={(ev) => setDescripcion(ev.target.value.slice(0, 400))} rows={3} className="adm-input" placeholder="Pesa lo que tiene que pesar." />}
      </Campo>
      <p className="adm-ayuda">Recuerda: en la web nunca se dicen unidades ni se usa lenguaje de tienda («comprar», «oferta»…).</p>

      <label className="adm-interruptor">
        <input type="checkbox" name="agotado" defaultChecked={valores.agotado} />
        <span>
          <strong>Se ha agotado</strong>
          <span className="adm-ayuda block">Pasa a «Ya no hay» con el sello de agotado.</span>
        </span>
      </label>
      <label className="adm-interruptor">
        <input type="checkbox" name="publicado" defaultChecked={valores.publicado} />
        <span>
          <strong>Visible en la web</strong>
          <span className="adm-ayuda block">Desmárcalo para esconderla sin borrarla.</span>
        </span>
      </label>

      <BotonEnviar>{valores.id ? "Guardar cambios" : "Guardar y añadir fotos"}</BotonEnviar>
    </form>
  );
}

/** Fotos de la prenda: subir (de una en una, con su descripción), ordenar y borrar. */
export function Fotos({ productoId, nombre, fotos }: { productoId: string; nombre: string; fotos: FotoAdmin[] }) {
  const [estado, accion] = useActionState(subirFoto, null);
  const [vista, setVista] = useState<string | null>(null);
  const formulario = useRef<HTMLFormElement>(null);

  return (
    <section className="adm-bloque" aria-labelledby="fotos">
      <h2 id="fotos" className="adm-bloque__titulo">
        Fotos <span className="adm-bloque__nota">La primera es la que sale en la web. Mejor sobre fondo gris liso y siempre con el mismo encuadre.</span>
      </h2>
      {fotos.length ? (
        <ol className="adm-fotos">
          {fotos.map((f, i) => (
            <li key={f.id} className="adm-foto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/admin/fotos/${f.ruta_pequena}`} alt={f.alt} className="adm-foto__img" />
              <p className="adm-ayuda">{i === 0 ? "Principal · " : ""}{f.alt}</p>
              <div className="adm-foto__botones">
                <form action={moverFoto}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="hacia" value="antes" />
                  <button type="submit" className="adm-icono" disabled={i === 0} aria-label={`Mover antes: ${f.alt}`}>
                    ←
                  </button>
                </form>
                <form action={moverFoto}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="hacia" value="despues" />
                  <button type="submit" className="adm-icono" disabled={i === fotos.length - 1} aria-label={`Mover después: ${f.alt}`}>
                    →
                  </button>
                </form>
                <form
                  action={borrarFoto}
                  onSubmit={(ev) => {
                    if (!window.confirm("¿Borrar esta foto? No se puede deshacer.")) ev.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={f.id} />
                  <button type="submit" className="adm-icono adm-icono--peligro" aria-label={`Borrar foto: ${f.alt}`}>
                    Borrar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="adm-vacio">Todavía no tiene fotos. Mientras tanto, en la web se ve el hueco con el logo.</p>
      )}

      {fotos.length < 8 ? (
        <form
          ref={formulario}
          action={async (fd) => {
            await accion(fd);
            formulario.current?.reset();
            setVista(null);
          }}
          className="adm-form adm-subida"
        >
          {estado ? <Aviso ok={estado.ok}>{estado.mensaje}</Aviso> : null}
          <input type="hidden" name="producto_id" value={productoId} />
          <Campo etiqueta="Añadir una foto" nombre="archivo" ayuda="JPG, PNG o WebP de hasta 10 MB. Desde el móvil puedes elegirla de la galería.">
            {(p) => (
              <input
                {...p}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className="adm-archivo"
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  setVista(f ? URL.createObjectURL(f) : null);
                }}
              />
            )}
          </Campo>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {vista ? <img src={vista} alt="Vista previa de la foto elegida" className="adm-foto__img adm-foto__img--vista" /> : null}
          <Campo etiqueta="¿Qué se ve en la foto?" nombre="alt" ayuda="Para personas que no ven bien y para Google. Por ejemplo: «Sudadera negra con el gorila en la espalda».">
            {(p) => <input {...p} defaultValue={`${nombre} de CGA`} maxLength={200} required className="adm-input" />}
          </Campo>
          <BotonEnviar pendiente="Subiendo… (puede tardar unos segundos)">Subir foto</BotonEnviar>
        </form>
      ) : (
        <p className="adm-ayuda">Has llegado al máximo de 8 fotos. Borra alguna para subir otra.</p>
      )}
    </section>
  );
}

export function BorrarPrenda({ id }: { id: string }) {
  const [estado, accion] = useActionState(borrarPrenda, null);
  return (
    <details className="adm-peligro">
      <summary>Borrar esta prenda</summary>
      <form
        action={accion}
        className="adm-form"
        onSubmit={(ev) => {
          if (!window.confirm("¿Seguro? Se borrará la prenda con todas sus fotos.")) ev.preventDefault();
        }}
      >
        <p className="adm-texto">
          Se borrará la prenda y todas sus fotos. <strong>No se puede deshacer.</strong> Si solo se ha acabado, mejor márcala como «Se ha agotado».
        </p>
        {estado && !estado.ok ? <Aviso ok={false}>{estado.mensaje}</Aviso> : null}
        <input type="hidden" name="id" value={id} />
        <BotonEnviar variante="peligro" pendiente="Borrando…">
          Borrar para siempre
        </BotonEnviar>
      </form>
    </details>
  );
}
