import { clientePublico } from "@/lib/supabase/publico";
import { supabaseConfigurado } from "@/lib/supabase/config";

// Fotos de prendas. El almacén es privado: Supabase (RLS) solo entrega la foto si su prenda está publicada
// y ya ha salido. Así una prenda de «Lo próximo» no se puede ver antes de tiempo ni adivinando la dirección.
const RUTA_VALIDA = /^[0-9a-f-]{36}\/[0-9a-f-]{36}(-p)?\.webp$/;

function noEncontrada() {
  return new Response("No encontrada", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const camino = ruta.join("/");
  if (!supabaseConfigurado || !RUTA_VALIDA.test(camino)) return noEncontrada();

  const { data, error } = await clientePublico().storage.from("prendas").download(camino);
  if (error || !data) return noEncontrada();
  // Doble comprobación del contenido: tiene que ser WebP de verdad
  const bytes = new Uint8Array(await data.arrayBuffer());
  const esWebp = bytes.length > 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!esWebp) return noEncontrada();

  return new Response(bytes, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(bytes.length),
      "Content-Disposition": "inline",
      // El nombre de cada foto es único (no se reutiliza): se puede cachear; una hora en el navegador
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
