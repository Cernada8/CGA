"use server";

import { redirect } from "next/navigation";
import { calcularEstado, rutaDePaso } from "@/lib/admin/sesion";
import { problemasContrasena, texto, type Resultado } from "@/lib/admin/validar";
import { clienteAdmin } from "@/lib/supabase/admin";
import { supabaseConfigurado } from "@/lib/supabase/config";

const MENSAJE_GENERICO = "Correo o contraseña incorrectos.";

/** Paso 1: correo y contraseña. El mensaje de error es siempre el mismo (no revela qué correos existen). */
export async function entrar(_previo: Resultado | null, fd: FormData): Promise<Resultado> {
  if (!supabaseConfigurado) return { ok: false, mensaje: "El panel no está conectado todavía." };
  const email = texto(fd, "email", 254).toLowerCase();
  const clave = typeof fd.get("clave") === "string" ? (fd.get("clave") as string).slice(0, 200) : "";
  if (!email || !clave) return { ok: false, mensaje: "Escribe tu correo y tu contraseña." };

  const supabase = await clienteAdmin();
  const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
  if (error) {
    const limite = error.status === 429 || /rate/i.test(error.message);
    return { ok: false, mensaje: limite ? "Demasiados intentos. Espera unos minutos y vuelve a probar." : MENSAJE_GENERICO };
  }
  const estado = await calcularEstado();
  if (estado.motivo === "sin-acceso") return { ok: false, mensaje: MENSAJE_GENERICO };
  redirect(rutaDePaso(estado.paso));
}

const SEIS_CIFRAS = /^\d{6}$/;

/** Paso «código»: los 6 números de Google Authenticator. */
export async function verificarCodigo(_previo: Resultado | null, fd: FormData): Promise<Resultado> {
  const codigo = texto(fd, "codigo", 10).replace(/\s/g, "");
  if (!SEIS_CIFRAS.test(codigo)) return { ok: false, mensaje: "El código son 6 números." };
  const supabase = await clienteAdmin();
  const { data: factores } = await supabase.auth.mfa.listFactors();
  const factor = factores?.totp.find((f) => f.status === "verified");
  if (!factor) redirect("/admin/doble-factor");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: codigo });
  if (error) {
    const limite = error.status === 429 || /rate/i.test(error.message);
    return { ok: false, mensaje: limite ? "Demasiados intentos. Espera un minuto." : "Ese código no vale. Mira el que aparece ahora en la app (cambia cada 30 segundos)." };
  }
  redirect(rutaDePaso((await calcularEstado()).paso));
}

/** Vincular el móvil: crea el código QR (si quedó uno a medias, se descarta y se crea otro). */
export async function prepararVinculo(): Promise<{ ok: boolean; qr?: string; secreto?: string; factorId?: string; mensaje?: string }> {
  const estado = await calcularEstado();
  if (estado.paso !== "doble-factor") return { ok: false, mensaje: "Este paso no te toca ahora." };
  const supabase = await clienteAdmin();
  const { data: factores } = await supabase.auth.mfa.listFactors();
  for (const f of factores?.all ?? []) {
    if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Móvil ${new Date().toISOString().slice(0, 10)}`, issuer: "CGA Panel" });
  if (error || !data) return { ok: false, mensaje: "No se ha podido preparar el código. Recarga la página." };
  return { ok: true, qr: data.totp.qr_code, secreto: data.totp.secret, factorId: data.id };
}

export async function confirmarVinculo(_previo: Resultado | null, fd: FormData): Promise<Resultado> {
  const estado = await calcularEstado();
  if (estado.paso !== "doble-factor") redirect(rutaDePaso(estado.paso));
  const factorId = texto(fd, "factorId", 64);
  const codigo = texto(fd, "codigo", 10).replace(/\s/g, "");
  if (!SEIS_CIFRAS.test(codigo)) return { ok: false, mensaje: "El código son 6 números." };
  const supabase = await clienteAdmin();
  // Solo puede ser un factor suyo y sin verificar (Supabase lo comprueba también)
  const { data: factores } = await supabase.auth.mfa.listFactors();
  const factor = factores?.all.find((f) => f.id === factorId && f.status !== "verified");
  if (!factor) return { ok: false, mensaje: "El código QR ha caducado. Recarga la página para generar otro." };
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: codigo });
  if (error) return { ok: false, mensaje: "Ese código no vale. Escribe el que aparece ahora en la app." };
  redirect("/admin?bienvenida=1");
}

/** Cambio de contraseña: obligatorio la primera vez y disponible desde «Tu cuenta». */
export async function cambiarContrasena(_previo: Resultado | null, fd: FormData): Promise<Resultado> {
  const estado = await calcularEstado();
  if (estado.paso !== "contrasena" && estado.paso !== "dentro") redirect(rutaDePaso(estado.paso));
  const clave = typeof fd.get("clave") === "string" ? (fd.get("clave") as string) : "";
  const repetida = typeof fd.get("repetida") === "string" ? (fd.get("repetida") as string) : "";
  const problemas = problemasContrasena(clave, estado.email ?? "");
  if (problemas.length) return { ok: false, mensaje: "La contraseña no cumple todo lo necesario.", errores: { clave: problemas.join(" ") } };
  if (clave !== repetida) return { ok: false, mensaje: "Las dos contraseñas no coinciden.", errores: { repetida: "No coincide con la primera." } };

  const supabase = await clienteAdmin();
  const { error } = await supabase.auth.updateUser({ password: clave });
  if (error) {
    const igual = /same|different/i.test(error.message);
    const debil = /weak|pwned|leaked/i.test(error.message);
    return { ok: false, mensaje: igual ? "Tiene que ser distinta de la anterior." : debil ? "Esa contraseña es demasiado conocida. Elige otra." : "No se ha podido cambiar. Inténtalo de nuevo." };
  }
  await supabase.from("admins").update({ debe_cambiar_contrasena: false }).eq("email", (estado.email ?? "").toLowerCase());
  if (estado.paso === "dentro") return { ok: true, mensaje: "Contraseña cambiada." };
  redirect(rutaDePaso((await calcularEstado()).paso));
}

/** Cerrar sesión (en este dispositivo y en el resto). */
export async function salir() {
  const supabase = await clienteAdmin();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/admin/entrar?motivo=salida");
}
