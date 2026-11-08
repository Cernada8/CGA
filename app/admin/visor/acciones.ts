"use server";

import { redirect } from "next/navigation";
import { abrirSesionVisor, cerrarSesionVisor, credencialesCorrectas, visorConfigurado } from "@/lib/visor";

export type ResultadoVisor = { ok: false; mensaje: string } | null;

export async function entrarVisor(_previo: ResultadoVisor, fd: FormData): Promise<ResultadoVisor> {
  const usuario = String(fd.get("usuario") ?? "").slice(0, 100);
  const clave = String(fd.get("clave") ?? "").slice(0, 200);
  if (!visorConfigurado) return { ok: false, mensaje: "El acceso de consulta todavía no está activado." };
  if (!usuario || !clave || !credencialesCorrectas(usuario, clave)) {
    // Un segundo de espera en cada fallo: probar contraseñas a ciegas se vuelve inútil
    await new Promise((r) => setTimeout(r, 1000));
    return { ok: false, mensaje: "Usuario o contraseña incorrectos." };
  }
  await abrirSesionVisor();
  redirect("/admin/visor/visitas");
}

export async function salirVisor() {
  await cerrarSesionVisor();
  redirect("/admin/visor?motivo=salida");
}
