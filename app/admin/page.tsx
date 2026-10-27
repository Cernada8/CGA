import Link from "next/link";
import { marcarAgotada } from "./acciones";
import { CuentaPanel } from "@/components/admin/Cuenta";
import { Marco } from "@/components/admin/Marco";
import { Aviso } from "@/components/admin/ui";
import { dondeSeVe, leerTodo, type PrendaAdmin } from "@/lib/admin/datos";
import { fechaLarga } from "@/lib/admin/fechas";
import { requerirAdmin } from "@/lib/admin/sesion";

export const metadata = { title: "Inicio" };

const AVISOS: Record<string, string> = {
  bienvenida: "Todo listo. Tu móvil ha quedado vinculado: a partir de ahora entrarás con tu contraseña y el código.",
  borrado: "Lanzamiento borrado.",
  borrada: "Prenda borrada.",
};

function Miniatura({ prenda }: { prenda: PrendaAdmin }) {
  const foto = prenda.imagenes_producto[0];
  return foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/admin/fotos/${foto.ruta_pequena}`} alt="" className="adm-mini" loading="lazy" />
  ) : (
    <span className="adm-mini adm-mini--vacia" aria-hidden="true">
      Sin foto
    </span>
  );
}

function TarjetaPrenda({ prenda, agotar }: { prenda: PrendaAdmin; agotar: boolean | null }) {
  return (
    <li className="adm-prenda">
      <Link href={`/admin/prendas/${prenda.id}`} className="adm-prenda__enlace">
        <Miniatura prenda={prenda} />
        <span className="adm-prenda__nombre">{prenda.nombre ?? "Sin nombre"}</span>
        <span className="adm-prenda__chips">
          {!prenda.publicado ? <span className="adm-chip">Oculta</span> : null}
          {prenda.imagenes_producto.length === 0 ? <span className="adm-chip adm-chip--aviso">Falta la foto</span> : null}
        </span>
      </Link>
      {agotar !== null ? (
        <form action={marcarAgotada}>
          <input type="hidden" name="id" value={prenda.id} />
          <input type="hidden" name="agotado" value={agotar ? "true" : "false"} />
          <button type="submit" className="adm-boton adm-boton--secundario adm-boton--pequeno">
            {agotar ? "Se ha agotado" : "Volver a «Lo nuevo»"}
          </button>
        </form>
      ) : null}
    </li>
  );
}

export default async function Inicio({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requerirAdmin();
  const [lanzamientos, sp] = await Promise.all([leerTodo(), searchParams]);
  const aviso = Object.keys(AVISOS).find((k) => sp[k]);

  const proximos = lanzamientos.filter((d) => dondeSeVe(d) === "proximo").sort((a, b) => (a.fecha_lanzamiento ?? "").localeCompare(b.fecha_lanzamiento ?? ""));
  const nuevos = lanzamientos.filter((d) => dondeSeVe(d) === "nuevo");
  const prendasNuevas = nuevos.flatMap((d) => d.productos.filter((p) => !p.agotado));
  const prendasAgotadas = [
    ...nuevos.flatMap((d) => d.productos.filter((p) => p.agotado)),
    ...lanzamientos.filter((d) => dondeSeVe(d) === "ya-no-hay").flatMap((d) => d.productos),
  ];
  const ocultos = lanzamientos.filter((d) => dondeSeVe(d) === "oculto");

  return (
    <Marco titulo="¿Qué quieres hacer hoy?">
      {aviso ? <Aviso ok>{AVISOS[aviso]}</Aviso> : null}
      <div className="adm-acciones">
        <Link href="/admin/prendas/nueva" className="adm-boton adm-boton--principal">
          + Añadir una prenda
        </Link>
        <Link href="/admin/lanzamientos/nuevo" className="adm-boton adm-boton--secundario">
          + Programar un lanzamiento con cuenta atrás
        </Link>
      </div>

      <section className="adm-bloque" aria-labelledby="b-proximo">
        <h2 id="b-proximo" className="adm-bloque__titulo">
          Lo próximo <span className="adm-bloque__nota">En la web sale la cuenta atrás. Las prendas no se enseñan hasta ese día.</span>
        </h2>
        {proximos.length ? (
          <ul className="adm-lanzamientos">
            {proximos.map((d) => (
              <li key={d.id} className="adm-lanzamiento" style={{ "--acento-lanzamiento": d.acento } as React.CSSProperties}>
                <div>
                  <p className="adm-lanzamiento__nombre">{d.nombre_interno}</p>
                  <p className="adm-lanzamiento__fecha">Sale el {fechaLarga(d.fecha_lanzamiento!)}</p>
                  <CuentaPanel fechaIso={d.fecha_lanzamiento!} />
                  <p className="adm-ayuda mt-2">
                    {d.productos.length === 1 ? "1 prenda preparada" : `${d.productos.length} prendas preparadas`} (ocultas hasta ese día)
                  </p>
                </div>
                <div className="adm-lanzamiento__botones">
                  <Link href={`/admin/lanzamientos/${d.id}`} className="adm-boton adm-boton--secundario">
                    Cambiar fecha o detalles
                  </Link>
                  <Link href={`/admin/prendas/nueva?lanzamiento=${d.id}`} className="adm-boton adm-boton--secundario">
                    + Prenda para este día
                  </Link>
                </div>
                {d.productos.length ? (
                  <ul className="adm-prendas">
                    {d.productos.map((p) => (
                      <TarjetaPrenda key={p.id} prenda={p} agotar={null} />
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-vacio">
            No hay nada programado. <Link href="/admin/lanzamientos/nuevo">Programa un lanzamiento</Link> y en la web aparecerá la cuenta atrás.
          </p>
        )}
      </section>

      <section className="adm-bloque" aria-labelledby="b-nuevo">
        <h2 id="b-nuevo" className="adm-bloque__titulo">
          Lo nuevo <span className="adm-bloque__nota">Lo que se ve ahora en la web. Cuando algo se acabe, pulsa «Se ha agotado».</span>
        </h2>
        {prendasNuevas.length ? (
          <ul className="adm-prendas">
            {prendasNuevas.map((p) => (
              <TarjetaPrenda key={p.id} prenda={p} agotar />
            ))}
          </ul>
        ) : (
          <p className="adm-vacio">No hay nada en «Lo nuevo».</p>
        )}
      </section>

      <section className="adm-bloque" aria-labelledby="b-agotado">
        <h2 id="b-agotado" className="adm-bloque__titulo">
          Ya no hay <span className="adm-bloque__nota">Lo que salió y se acabó. En la web lleva el sello de agotado.</span>
        </h2>
        {prendasAgotadas.length ? (
          <ul className="adm-prendas">
            {prendasAgotadas.map((p) => (
              <TarjetaPrenda key={p.id} prenda={p} agotar={p.agotado ? false : null} />
            ))}
          </ul>
        ) : (
          <p className="adm-vacio">Todavía no hay nada agotado.</p>
        )}
      </section>

      <section className="adm-bloque" aria-labelledby="b-lanz">
        <h2 id="b-lanz" className="adm-bloque__titulo">
          Todos los lanzamientos <span className="adm-bloque__nota">Cada lanzamiento agrupa prendas y tiene su color.</span>
        </h2>
        <ul className="adm-lista">
          {lanzamientos.map((d) => (
            <li key={d.id}>
              <Link href={`/admin/lanzamientos/${d.id}`} className="adm-lista__fila">
                <span className="adm-muestra" style={{ background: d.acento }} aria-hidden="true" />
                <span className="adm-lista__nombre">{d.nombre_interno}</span>
                <span className="adm-chip">
                  {{ proximo: "Lo próximo", nuevo: "Lo nuevo", "ya-no-hay": "Ya no hay", oculto: "Oculto" }[dondeSeVe(d)]}
                </span>
                <span className="adm-ayuda">{d.productos.length} prendas</span>
              </Link>
            </li>
          ))}
        </ul>
        {ocultos.length ? <p className="adm-ayuda mt-3">Los lanzamientos ocultos no aparecen en la web.</p> : null}
      </section>
    </Marco>
  );
}
