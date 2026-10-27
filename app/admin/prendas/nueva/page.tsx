import Link from "next/link";
import { FormPrenda } from "@/components/admin/FormPrenda";
import { Marco } from "@/components/admin/Marco";
import { dondeSeVe, leerTodo } from "@/lib/admin/datos";
import { opcionesLanzamiento } from "@/lib/admin/opciones";
import { requerirAdmin } from "@/lib/admin/sesion";
import { UUID } from "@/lib/admin/validar";

export const metadata = { title: "Añadir prenda" };

export default async function NuevaPrenda({ searchParams }: { searchParams: Promise<{ lanzamiento?: string }> }) {
  await requerirAdmin();
  const [lista, { lanzamiento }] = await Promise.all([leerTodo(), searchParams]);
  const elegido = lanzamiento && UUID.test(lanzamiento) && lista.some((d) => d.id === lanzamiento) ? lanzamiento : (lista.find((d) => dondeSeVe(d) === "nuevo")?.id ?? "");
  return (
    <Marco titulo="Añadir una prenda" volver={{ href: "/admin", texto: "Volver al inicio" }}>
      {lista.length ? (
        <FormPrenda
          lanzamientos={opcionesLanzamiento(lista)}
          valores={{ drop_id: elegido, nombre: "", categoria: "Camiseta", descripcion: "", gramaje: "", linea: "general", agotado: false, publicado: true }}
        />
      ) : (
        <p className="adm-vacio">
          Primero crea un lanzamiento: <Link href="/admin/lanzamientos/nuevo">programar un lanzamiento</Link>.
        </p>
      )}
      <p className="adm-ayuda mt-6">
        ¿Va en un lanzamiento que aún no existe? <Link href="/admin/lanzamientos/nuevo">Créalo primero</Link>.
      </p>
    </Marco>
  );
}
