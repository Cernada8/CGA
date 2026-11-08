import { redirect } from "next/navigation";
import { FormVisor } from "@/components/admin/FormVisor";
import { PantallaAcceso } from "@/components/admin/Marco";
import { Aviso } from "@/components/admin/ui";
import { haySesionVisor } from "@/lib/visor";

export const metadata = { title: "Consultar visitas" };

export default async function EntrarVisor({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  if (await haySesionVisor()) redirect("/admin/visor/visitas");
  const { motivo } = await searchParams;
  return (
    <PantallaAcceso titulo="Consultar visitas">
      {motivo === "salida" ? <Aviso ok>Has salido.</Aviso> : null}
      <p className="adm-ayuda">Acceso solo de consulta: puedes ver las visitas de la web, no cambiar nada.</p>
      <FormVisor />
    </PantallaAcceso>
  );
}
