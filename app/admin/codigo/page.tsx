import { PantallaAcceso } from "@/components/admin/Marco";
import { FormCodigo } from "@/components/admin/FormulariosAcceso";
import { requerirPaso } from "@/lib/admin/sesion";

export const metadata = { title: "Código" };

export default async function Codigo() {
  await requerirPaso("codigo");
  return (
    <PantallaAcceso titulo="Un paso más">
      <p className="adm-texto">Para que nadie pueda entrar aunque sepa tu contraseña, confirma que eres tú con tu móvil.</p>
      <FormCodigo />
      <p className="adm-ayuda mt-6">¿Has perdido el móvil? Pídele a Alex que desvincule el anterior.</p>
    </PantallaAcceso>
  );
}
