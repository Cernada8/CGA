import "server-only";

// Conexión con Supabase. Solo en el servidor: ninguna clave llega al navegador.
// La clave publicable es de solo lectura pública (RLS manda); la secreta no se usa en esta web.
export const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
export const SUPABASE_CLAVE_PUBLICABLE = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

/** Sin variables de entorno (pruebas, desarrollo sin conexión) la web usa los datos de ejemplo. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_CLAVE_PUBLICABLE);
