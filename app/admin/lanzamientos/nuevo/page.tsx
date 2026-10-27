import { FormLanzamiento } from "@/components/admin/FormLanzamiento";
import { Marco } from "@/components/admin/Marco";
import { requerirAdmin } from "@/lib/admin/sesion";

export const metadata = { title: "Programar lanzamiento" };

export default async function NuevoLanzamiento() {
  await requerirAdmin();
  return (
    <Marco titulo="Programar un lanzamiento" volver={{ href: "/admin", texto: "Volver al inicio" }}>
      <p className="adm-texto">Un lanzamiento agrupa las prendas que salen juntas. Si sale más adelante, la web muestra la cuenta atrás.</p>
      <FormLanzamiento valores={{ nombre: "", estado: "proximo", fecha: "", hora: "20:00", acento: "#a39c84", publicado: true }} />
    </Marco>
  );
}
