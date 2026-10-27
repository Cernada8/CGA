import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CLAVE_PUBLICABLE, SUPABASE_URL } from "./config";

/** Cliente anónimo para leer lo público (RLS solo deja ver lo publicado y ya lanzado). Sin sesión. */
export function clientePublico() {
  return createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICABLE, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
