import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Resumen } from "@/lib/admin/visitas";
import { clienteContador, contadorConfigurado } from "@/lib/supabase/contador";

// Acceso «solo ver» con nombre y contraseña (sin cuenta de Supabase). Solo enseña las visitas; no hay nada
// que permita cambiar algo. Variables en Vercel:
//   VISOR_USUARIO     nombre de usuario (p. ej. cristiano)
//   VISOR_CLAVE_HASH  huella de la contraseña (npm run visor:clave; la contraseña no se guarda en ningún sitio)
//   VISOR_SECRETO     firma de la sesión
//   VISOR_CLAVE_BD    clave para que Supabase entregue el resumen (su huella está en privado.ajustes)

const COOKIE = "cga_visor";
const HORAS = 12;

export const visorConfigurado = Boolean(
  process.env.VISOR_USUARIO && process.env.VISOR_CLAVE_HASH && process.env.VISOR_SECRETO && process.env.VISOR_CLAVE_BD && contadorConfigurado,
);

function iguales(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Formato de la huella: scrypt$N$r$p$sal(base64)$hash(base64) */
function claveCorrecta(clave: string, huella: string) {
  const [alg, n, r, p, sal, hash] = huella.split("$");
  if (alg !== "scrypt" || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64");
  const calculado = scryptSync(clave.normalize("NFC"), Buffer.from(sal, "base64"), esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 256 * 1024 * 1024,
  });
  return iguales(calculado, esperado);
}

export function credencialesCorrectas(usuario: string, clave: string) {
  if (!visorConfigurado) return false;
  const usuarioOk = iguales(Buffer.from(usuario.trim().toLowerCase()), Buffer.from(process.env.VISOR_USUARIO!.trim().toLowerCase()));
  // Se calcula la huella siempre (aunque el usuario no coincida) para no dar pistas por el tiempo de respuesta
  const claveOk = claveCorrecta(clave, process.env.VISOR_CLAVE_HASH!);
  return usuarioOk && claveOk;
}

function firmar(datos: string) {
  return createHmac("sha256", process.env.VISOR_SECRETO!).update(datos).digest("base64url");
}

export async function abrirSesionVisor() {
  const caduca = Date.now() + HORAS * 3600_000;
  const datos = Buffer.from(JSON.stringify({ caduca })).toString("base64url");
  (await cookies()).set(COOKIE, `${datos}.${firmar(datos)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: HORAS * 3600,
  });
}

export async function cerrarSesionVisor() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function haySesionVisor() {
  if (!visorConfigurado) return false;
  const valor = (await cookies()).get(COOKIE)?.value ?? "";
  const [datos, firma] = valor.split(".");
  if (!datos || !firma || !iguales(Buffer.from(firma), Buffer.from(firmar(datos)))) return false;
  try {
    return JSON.parse(Buffer.from(datos, "base64url").toString()).caduca > Date.now();
  } catch {
    return false;
  }
}

/** El resumen de visitas para el visor (Supabase solo lo entrega con VISOR_CLAVE_BD) */
export async function leerResumenVisor(dias: number): Promise<Resumen | null> {
  const { data, error } = await clienteContador().rpc("resumen_visitas_visor", { p_clave: process.env.VISOR_CLAVE_BD, p_dias: dias });
  if (error || !data) return null;
  return data as Resumen;
}
