import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { clienteAdmin } from "@/lib/supabase/admin";
import { supabaseConfigurado } from "@/lib/supabase/config";

export type Paso = "entrar" | "codigo" | "contrasena" | "doble-factor" | "dentro";

export type EstadoSesion = {
  paso: Paso;
  email: string | null;
  motivo?: "sin-acceso";
};

/**
 * Dónde está el usuario en el acceso al panel. Se valida contra el servidor de Supabase (getUser),
 * nunca solo con lo que dice la cookie.
 * Orden: contraseña → (código si ya tiene móvil vinculado) → cambio de contraseña obligatorio → vincular móvil → dentro.
 */
export async function calcularEstado(): Promise<EstadoSesion> {
  if (!supabaseConfigurado) return { paso: "entrar", email: null };
  const supabase = await clienteAdmin();
  const { data: u } = await supabase.auth.getUser();
  const usuario = u.user;
  if (!usuario?.email) return { paso: "entrar", email: null };

  const { data: fila } = await supabase.from("admins").select("debe_cambiar_contrasena").eq("email", usuario.email.toLowerCase()).maybeSingle();
  if (!fila) {
    // Tiene cuenta pero no está en la lista: fuera
    await supabase.auth.signOut();
    return { paso: "entrar", email: null, motivo: "sin-acceso" };
  }

  const [{ data: nivel }, { data: factores }] = await Promise.all([
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    supabase.auth.mfa.listFactors(),
  ]);
  const tieneMovil = (factores?.totp ?? []).some((f) => f.status === "verified");
  const email = usuario.email;
  if (tieneMovil && nivel?.currentLevel !== "aal2") return { paso: "codigo", email };
  if (fila.debe_cambiar_contrasena) return { paso: "contrasena", email };
  if (!tieneMovil) return { paso: "doble-factor", email };
  return { paso: "dentro", email };
}

/** Igual que calcularEstado pero una sola vez por petición (para páginas y layouts). */
export const estadoSesion = cache(calcularEstado);

const RUTA: Record<Exclude<Paso, "dentro">, string> = {
  entrar: "/admin/entrar",
  codigo: "/admin/codigo",
  contrasena: "/admin/contrasena",
  "doble-factor": "/admin/doble-factor",
};

/** Para páginas del panel: si no está dentro del todo, lo lleva al paso que le toca. */
export async function requerirAdmin() {
  const e = await estadoSesion();
  if (e.paso !== "dentro") redirect(e.motivo ? `${RUTA[e.paso]}?error=${e.motivo}` : RUTA[e.paso]);
  return e;
}

/** Para páginas de un paso concreto del acceso: si le toca otro, lo manda allí. */
export async function requerirPaso(paso: Exclude<Paso, "dentro">) {
  const e = await estadoSesion();
  if (e.paso === "dentro") redirect("/admin");
  if (e.paso !== paso) redirect(RUTA[e.paso]);
  return e;
}

export function rutaDePaso(paso: Paso) {
  return paso === "dentro" ? "/admin" : RUTA[paso];
}

/** Para acciones (Server Actions): o admin completo, o error. Nunca se fía de la página que la llamó. */
export async function adminParaAccion() {
  const e = await calcularEstado();
  if (e.paso !== "dentro") throw new Error("NO_AUTORIZADO");
  return { supabase: await clienteAdmin(), email: e.email! };
}
