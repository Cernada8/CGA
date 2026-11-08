import "server-only";
import { createClient } from "@supabase/supabase-js";

// Conexión SOLO para apuntar visitas. Usa sus propias variables (CONTADOR_SUPABASE_URL y CONTADOR_SUPABASE_KEY,
// la clave publicable) para poder activar el contador sin cambiar de dónde lee la web su catálogo
// (si se ponen SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY, la web pasa a leer las prendas de Supabase).
// Si no están, usa las generales.
const URL_CONTADOR = process.env.CONTADOR_SUPABASE_URL || process.env.SUPABASE_URL || "";
const CLAVE_CONTADOR = process.env.CONTADOR_SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";

export const contadorConfigurado = Boolean(URL_CONTADOR && CLAVE_CONTADOR);
/** Secreto para el identificador anónimo diario (VISITAS_SAL; si falta, la clave del contador) */
export const SAL_VISITAS = process.env.VISITAS_SAL || CLAVE_CONTADOR;

export function clienteContador() {
  return createClient(URL_CONTADOR, CLAVE_CONTADOR, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
