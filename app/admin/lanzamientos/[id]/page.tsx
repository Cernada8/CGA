import Link from "next/link";
import { notFound } from "next/navigation";
import { BorrarLanzamiento, FormLanzamiento } from "@/components/admin/FormLanzamiento";
import { Marco } from "@/components/admin/Marco";
import { Aviso } from "@/components/admin/ui";
import { leerTodo } from "@/lib/admin/datos";
import { isoAMadrid } from "@/lib/admin/fechas";
import { requerirAdmin } from "@/lib/admin/sesion";
import { UUID } from "@/lib/admin/validar";

export const metadata = { title: "Lanzamiento" };

export default async function EditarLanzamiento({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> }) {
  await requerirAdmin();
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const d = (await leerTodo()).find((x) => x.id === id);
  if (!d) notFound();
  const { fecha, hora } = isoAMadrid(d.fecha_lanzamiento);
  return (
    <Marco titulo={d.nombre_interno} volver={{ href: "/admin", texto: "Volver al inicio" }}>
      {creado ? <Aviso ok>Lanzamiento creado. Ahora añádele sus prendas.</Aviso> : null}
      <FormLanzamiento valores={{ id: d.id, nombre: d.nombre_interno, estado: d.estado, fecha, hora, acento: d.acento, publicado: d.publicado }} />

      <section className="adm-bloque" aria-labelledby="sus-prendas">
        <h2 id="sus-prendas" className="adm-bloque__titulo">
          Sus prendas
        </h2>
        {d.productos.length ? (
          <ul className="adm-lista">
            {d.productos.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/prendas/${p.id}`} className="adm-lista__fila">
                  <span className="adm-lista__nombre">{p.nombre ?? "Sin nombre"}</span>
                  {p.agotado ? <span className="adm-chip">Agotada</span> : null}
                  {!p.publicado ? <span className="adm-chip">Oculta</span> : null}
                  <span className="adm-ayuda">{p.imagenes_producto.length} fotos</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-vacio">Todavía no tiene prendas.</p>
        )}
        <Link href={`/admin/prendas/nueva?lanzamiento=${d.id}`} className="adm-boton adm-boton--secundario mt-4">
          + Añadir una prenda a este lanzamiento
        </Link>
      </section>

      <BorrarLanzamiento id={d.id} prendas={d.productos.length} />
    </Marco>
  );
}
