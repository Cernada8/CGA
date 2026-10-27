import { notFound } from "next/navigation";
import { BorrarPrenda, Fotos, FormPrenda } from "@/components/admin/FormPrenda";
import { Marco } from "@/components/admin/Marco";
import { Aviso } from "@/components/admin/ui";
import { leerPrenda, leerTodo } from "@/lib/admin/datos";
import { opcionesLanzamiento } from "@/lib/admin/opciones";
import { requerirAdmin } from "@/lib/admin/sesion";
import { UUID } from "@/lib/admin/validar";

export const metadata = { title: "Prenda" };

export default async function EditarPrenda({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creada?: string }> }) {
  await requerirAdmin();
  const [{ id }, { creada }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();
  const [p, lista] = await Promise.all([leerPrenda(id), leerTodo()]);
  if (!p) notFound();
  return (
    <Marco titulo={p.nombre ?? "Prenda"} volver={{ href: "/admin", texto: "Volver al inicio" }}>
      {creada ? <Aviso ok>Prenda guardada. Ahora añádele las fotos.</Aviso> : null}
      <Fotos productoId={p.id} nombre={p.nombre ?? "Prenda"} fotos={p.imagenes_producto} />
      <section className="adm-bloque" aria-labelledby="datos">
        <h2 id="datos" className="adm-bloque__titulo">
          Datos de la prenda
        </h2>
        <FormPrenda
          lanzamientos={opcionesLanzamiento(lista)}
          valores={{
            id: p.id,
            drop_id: p.drop_id,
            nombre: p.nombre ?? "",
            categoria: p.categoria,
            descripcion: p.descripcion ?? "",
            gramaje: p.gramaje_g ? String(p.gramaje_g) : "",
            linea: p.linea,
            agotado: p.agotado,
            publicado: p.publicado,
          }}
        />
      </section>
      <BorrarPrenda id={p.id} />
    </Marco>
  );
}
