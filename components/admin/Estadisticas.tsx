import Link from "next/link";
import type { Cuenta, Resumen } from "@/lib/admin/visitas";

const NUM = new Intl.NumberFormat("es-ES");
const PAIS = new Intl.DisplayNames(["es"], { type: "region" });
const DIA_CORTO = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });
const DIA_LARGO = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const NOMBRE_RUTA: Record<string, string> = { "/": "Portada", "/colaboraciones": "Colaboraciones" };
const NOMBRE_DISPOSITIVO: Record<string, string> = { movil: "Móvil", tableta: "Tableta", ordenador: "Ordenador" };
const NOMBRE_ORIGEN: Record<string, string> = {
  directo: "Directo (enlace o escrito a mano)",
  "instagram.com": "Instagram",
  "google.com": "Google",
  "google.es": "Google",
  "facebook.com": "Facebook",
  "t.co": "X (Twitter)",
  "x.com": "X (Twitter)",
  "wa.me": "WhatsApp",
};

const fecha = (iso: string) => new Date(`${iso}T00:00:00Z`);
const nombreRuta = (r: string) => NOMBRE_RUTA[r] ?? (r.startsWith("/prenda/") ? `Prenda: ${r.slice(8).replaceAll("-", " ")}` : r);
const nombrePais = (c: string) => (c === "??" ? "Desconocido" : (PAIS.of(c) ?? c));

/** Panel de visitas: cifras grandes, gráfica por día y de dónde viene la gente. Sin librerías (SVG propio). */
export function Estadisticas({ resumen, rangos }: { resumen: Resumen; rangos: readonly number[] }) {
  const { por_dia } = resumen;
  const dias = por_dia.length || 1;
  const media = resumen.visitas / dias;
  const mejor = por_dia.reduce((a, d) => (d.visitas > (a?.visitas ?? -1) ? d : a), por_dia[0]);
  const ayer = por_dia.at(-2);
  const sinDatos = resumen.visitas === 0;

  return (
    <div className="est">
      <nav aria-label="Periodo" className="est-rangos">
        {rangos.map((r) => (
          <Link key={r} href={`/admin/estadisticas?dias=${r}`} aria-current={r === resumen.dias ? "page" : undefined} className="est-rango">
            Últimos {r} días
          </Link>
        ))}
      </nav>

      {sinDatos ? (
        <p className="est-vacio">
          Todavía no hay visitas en este periodo. Se empiezan a contar desde que el contador está activo en la web publicada.
        </p>
      ) : null}

      <dl className="est-cifras">
        <Cifra titulo="Visitas" valor={resumen.visitas} nota={`Páginas vistas en ${resumen.dias} días`} />
        <Cifra titulo="Personas" valor={resumen.visitantes} nota="Visitantes únicos (por día)" />
        <Cifra titulo="Hoy" valor={resumen.hoy} nota={`${NUM.format(resumen.visitantes_hoy)} personas${ayer ? ` · ayer ${NUM.format(ayer.visitas)} visitas` : ""}`} />
        <Cifra titulo="Media al día" valor={Math.round(media * 10) / 10} nota={mejor && mejor.visitas > 0 ? `Mejor día: ${DIA_CORTO.format(fecha(mejor.dia))} (${NUM.format(mejor.visitas)})` : "—"} />
      </dl>

      <section className="est-bloque" aria-labelledby="est-por-dia">
        <h2 id="est-por-dia" className="est-subtitulo">Visitas por día</h2>
        <Grafica por_dia={por_dia} />
      </section>

      <div className="est-listas">
        <Lista id="est-paginas" titulo="Páginas más vistas" filas={resumen.paginas} nombre={nombreRuta} unidad="visitas" />
        <Lista id="est-origenes" titulo="De dónde vienen" filas={resumen.origenes} nombre={(c) => NOMBRE_ORIGEN[c] ?? c} unidad="personas" />
        <Lista id="est-paises" titulo="Países" filas={resumen.paises} nombre={nombrePais} unidad="personas" />
        <Lista id="est-dispositivos" titulo="Dispositivos" filas={resumen.dispositivos} nombre={(c) => NOMBRE_DISPOSITIVO[c] ?? c} unidad="personas" porcentaje />
      </div>

      <p className="est-nota">
        Contador propio, sin cookies: no se guarda la IP ni nada que identifique a nadie. «Personas» cuenta visitantes distintos de cada día.
      </p>
    </div>
  );
}

function Cifra({ titulo, valor, nota }: { titulo: string; valor: number; nota: string }) {
  return (
    <div className="est-cifra">
      <dt className="est-cifra__titulo">{titulo}</dt>
      <dd className="est-cifra__valor">{NUM.format(valor)}</dd>
      <dd className="est-cifra__nota">{nota}</dd>
    </div>
  );
}

/** Barras por día (visitas) con una línea de personas encima. SVG propio, con tabla oculta para lectores. */
function Grafica({ por_dia }: { por_dia: Resumen["por_dia"] }) {
  const W = 1000;
  const H = 260;
  const max = Math.max(1, ...por_dia.map((d) => d.visitas));
  const paso = W / Math.max(1, por_dia.length);
  const y = (v: number) => H - (v / max) * (H - 24);
  const linea = por_dia.map((d, i) => `${i === 0 ? "M" : "L"}${(i + 0.5) * paso},${y(d.visitantes)}`).join(" ");
  return (
    <figure className="est-grafica">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfica de visitas por día" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={y(max * f)} y2={y(max * f)} className="est-grafica__guia" />
        ))}
        {por_dia.map((d, i) => (
          <rect key={d.dia} x={i * paso + paso * 0.15} width={paso * 0.7} y={y(d.visitas)} height={H - y(d.visitas)} rx="3" className="est-grafica__barra">
            <title>{`${DIA_LARGO.format(fecha(d.dia))}: ${d.visitas} visitas, ${d.visitantes} personas`}</title>
          </rect>
        ))}
        <path d={linea} className="est-grafica__linea" />
      </svg>
      {/* Fechas en HTML (no dentro del SVG estirado, donde la letra se deformaría): inicio, mitad y hoy */}
      <div className="est-grafica__fechas" aria-hidden="true">
        {[por_dia[0], por_dia[Math.floor(por_dia.length / 2)], por_dia.at(-1)].map((d, i) =>
          d ? <span key={i}>{DIA_CORTO.format(fecha(d.dia))}</span> : null,
        )}
      </div>
      <figcaption className="est-leyenda">
        <span className="est-leyenda__barra" aria-hidden="true" /> Visitas
        <span className="est-leyenda__linea" aria-hidden="true" /> Personas · máximo {NUM.format(max)} en un día
      </figcaption>
      <table className="sr-only">
        <caption>Visitas y personas por día</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Visitas</th>
            <th scope="col">Personas</th>
          </tr>
        </thead>
        <tbody>
          {por_dia.map((d) => (
            <tr key={d.dia}>
              <th scope="row">{DIA_LARGO.format(fecha(d.dia))}</th>
              <td>{d.visitas}</td>
              <td>{d.visitantes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Lista({ id, titulo, filas, nombre, unidad, porcentaje = false }: { id: string; titulo: string; filas: Cuenta[]; nombre: (c: string) => string; unidad: string; porcentaje?: boolean }) {
  const total = filas.reduce((t, f) => t + f.total, 0) || 1;
  const max = Math.max(1, ...filas.map((f) => f.total));
  return (
    <section className="est-bloque" aria-labelledby={id}>
      <h2 id={id} className="est-subtitulo">{titulo}</h2>
      {filas.length ? (
        <ol className="est-lista">
          {filas.map((f) => (
            <li key={f.clave} className="est-lista__fila" style={{ "--parte": f.total / max } as React.CSSProperties}>
              <span className="est-lista__nombre">{nombre(f.clave)}</span>
              <span className="est-lista__total">
                {porcentaje ? `${Math.round((f.total / total) * 100)} %` : NUM.format(f.total)}
                <span className="sr-only"> {unidad}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="est-lista__vacia">Sin datos todavía.</p>
      )}
    </section>
  );
}
