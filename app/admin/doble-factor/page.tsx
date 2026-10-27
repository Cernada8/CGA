import { PantallaAcceso } from "@/components/admin/Marco";
import { FormVincular } from "@/components/admin/FormulariosAcceso";
import { requerirPaso } from "@/lib/admin/sesion";

export const metadata = { title: "Vincular el móvil" };

export default async function DobleFactor() {
  await requerirPaso("doble-factor");
  return (
    <PantallaAcceso titulo="Vincula tu móvil">
      <p className="adm-texto">Solo se hace una vez. Desde ahora, para entrar te pediremos tu contraseña y un código que sale en tu móvil.</p>
      <FormVincular />
    </PantallaAcceso>
  );
}
