import { PantallaAcceso } from "@/components/admin/Marco";
import { FormEntrar } from "@/components/admin/FormulariosAcceso";
import { Aviso } from "@/components/admin/ui";
import { estadoSesion, rutaDePaso } from "@/lib/admin/sesion";
import { redirect } from "next/navigation";

export const metadata = { title: "Entrar" };

const MOTIVOS: Record<string, { ok: boolean; texto: string }> = {
  inactividad: { ok: true, texto: "Has estado un rato sin usar el panel y se ha cerrado la sesión por seguridad." },
  salida: { ok: true, texto: "Has salido del panel." },
};

export default async function Entrar({ searchParams }: { searchParams: Promise<{ motivo?: string; error?: string }> }) {
  const estado = await estadoSesion();
  if (estado.paso !== "entrar") redirect(rutaDePaso(estado.paso));
  const { motivo, error } = await searchParams;
  const aviso = motivo ? MOTIVOS[motivo] : undefined;
  return (
    <PantallaAcceso titulo="Panel de CGA">
      {aviso ? <Aviso ok={aviso.ok}>{aviso.texto}</Aviso> : null}
      {error === "sin-acceso" ? <Aviso ok={false}>Correo o contraseña incorrectos.</Aviso> : null}
      <FormEntrar />
      <p className="adm-ayuda mt-6">¿Has olvidado la contraseña? Pídele a Alex que te la restablezca.</p>
    </PantallaAcceso>
  );
}
