import { Marco } from "@/components/admin/Marco";
import { leerActividad } from "@/lib/admin/datos";
import { haceCuanto } from "@/lib/admin/fechas";
import { requerirAdmin } from "@/lib/admin/sesion";

export const metadata = { title: "Actividad" };

const ACCION = { insert: "creó", update: "cambió", delete: "borró" } as Record<string, string>;
const TABLA = { drops: "el lanzamiento", productos: "la prenda", imagenes_producto: "una foto" } as Record<string, string>;

export default async function Actividad() {
  await requerirAdmin();
  const cambios = await leerActividad();
  return (
    <Marco titulo="Actividad" volver={{ href: "/admin", texto: "Volver al inicio" }}>
      <p className="adm-texto">Todo lo que se cambia en el panel queda apuntado aquí: quién, qué y cuándo. Nadie puede borrarlo.</p>
      {cambios.length ? (
        <ol className="adm-actividad">
          {cambios.map((c) => (
            <li key={c.id}>
              <time dateTime={c.creado} className="adm-ayuda">
                {haceCuanto(c.creado)}
              </time>
              <span>
                <strong>{c.email ?? "Sistema"}</strong> {ACCION[c.accion] ?? c.accion} {TABLA[c.tabla] ?? c.tabla}
                {c.resumen ? <> «{c.resumen}»</> : null}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="adm-vacio">Todavía no hay cambios.</p>
      )}
    </Marco>
  );
}
