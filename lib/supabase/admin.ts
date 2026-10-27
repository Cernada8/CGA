import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_CLAVE_PUBLICABLE, SUPABASE_URL } from "./config";

/**
 * Opciones de las cookies de sesión del panel:
 * - httpOnly: ningún script de la página puede leerlas (el panel no usa Supabase desde el navegador).
 * - sameSite strict + path /admin: solo viajan en peticiones del propio panel.
 * - secure en producción.
 */
export const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
};

/** Cliente con la sesión del admin (una instancia por petición). Todo pasa por RLS. */
export async function clienteAdmin() {
  const almacen = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICABLE, {
    cookieOptions: OPCIONES_COOKIE,
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) almacen.set(name, value, { ...options, ...OPCIONES_COOKIE });
        } catch {
          // Desde un Server Component no se pueden escribir cookies: el proxy ya refresca la sesión
        }
      },
    },
  });
}
