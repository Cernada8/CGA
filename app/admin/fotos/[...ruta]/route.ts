import { adminParaAccion } from "@/lib/admin/sesion";

// Miniaturas del panel: el admin ve también las fotos de lo que aún no ha salido. Nunca se cachean.
const RUTA_VALIDA = /^[0-9a-f-]{36}\/[0-9a-f-]{36}(-p)?\.webp$/;

export async function GET(_req: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const camino = (await params).ruta.join("/");
  const cabeceras = { "Cache-Control": "private, no-store" };
  if (!RUTA_VALIDA.test(camino)) return new Response(null, { status: 404, headers: cabeceras });
  let supabase;
  try {
    ({ supabase } = await adminParaAccion());
  } catch {
    return new Response(null, { status: 401, headers: cabeceras });
  }
  const { data, error } = await supabase.storage.from("prendas").download(camino);
  if (error || !data) return new Response(null, { status: 404, headers: cabeceras });
  return new Response(data, { headers: { ...cabeceras, "Content-Type": "image/webp", "Content-Disposition": "inline" } });
}
