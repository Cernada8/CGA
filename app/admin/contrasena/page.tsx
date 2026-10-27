import { PantallaAcceso } from "@/components/admin/Marco";
import { FormContrasena } from "@/components/admin/FormulariosAcceso";
import { requerirPaso } from "@/lib/admin/sesion";

export const metadata = { title: "Tu contraseña" };

export default async function Contrasena() {
  const { email } = await requerirPaso("contrasena");
  return (
    <PantallaAcceso titulo="Elige tu contraseña">
      <p className="adm-texto">La contraseña con la que has entrado es provisional. Pon una tuya que solo sepas tú.</p>
      <FormContrasena email={email ?? ""} />
    </PantallaAcceso>
  );
}
