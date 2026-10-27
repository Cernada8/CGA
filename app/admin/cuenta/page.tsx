import { salir } from "../acceso/acciones";
import { FormContrasena } from "@/components/admin/FormulariosAcceso";
import { Marco } from "@/components/admin/Marco";
import { requerirAdmin } from "@/lib/admin/sesion";

export const metadata = { title: "Tu cuenta" };

export default async function Cuenta() {
  const { email } = await requerirAdmin();
  return (
    <Marco titulo="Tu cuenta" volver={{ href: "/admin", texto: "Volver al inicio" }}>
      <dl className="adm-datos">
        <dt>Correo</dt>
        <dd>{email}</dd>
        <dt>Doble factor</dt>
        <dd>Activado con tu móvil (Google Authenticator)</dd>
        <dt>Cierre automático</dt>
        <dd>Tras 30 minutos sin usar el panel</dd>
      </dl>
      <section className="adm-bloque" aria-labelledby="cambiar">
        <h2 id="cambiar" className="adm-bloque__titulo">
          Cambiar la contraseña
        </h2>
        <FormContrasena email={email ?? ""} textoBoton="Cambiar contraseña" />
      </section>
      <section className="adm-bloque" aria-labelledby="sesiones">
        <h2 id="sesiones" className="adm-bloque__titulo">
          ¿Has entrado en un ordenador que no es tuyo?
        </h2>
        <p className="adm-texto">Cierra la sesión en todos los dispositivos a la vez.</p>
        <form action={salir}>
          <button type="submit" className="adm-boton adm-boton--secundario">
            Cerrar sesión en todas partes
          </button>
        </form>
      </section>
    </Marco>
  );
}
