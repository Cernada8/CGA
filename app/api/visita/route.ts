import { createHash } from "node:crypto";
import { clienteContador, contadorConfigurado, SAL_VISITAS } from "@/lib/supabase/contador";

// Contador de visitas propio (sin cookies ni terceros). Lo llama ContadorVisitas desde el navegador.
// No guarda IP ni navegador: solo un identificador anónimo que cambia cada día (ver la migración «visitas»).

const nada = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|headless|lighthouse|pagespeed|vercel|curl|wget|python|node-fetch|go-http/i;
const RUTA = /^\/[a-z0-9/_-]*$/;
const HOST = /^[a-z0-9.-]{1,100}$/;

function dispositivo(ua: string): "movil" | "tableta" | "ordenador" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tableta";
  if (/mobi|iphone|android/i.test(ua)) return "movil";
  return "ordenador";
}

/** Día en Madrid (AAAA-MM-DD): el identificador anónimo cambia cada medianoche española */
function hoyEnMadrid() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

export async function POST(req: Request) {
  if (!contadorConfigurado) return nada();
  // Solo desde la propia web
  const origen = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origen || !host || new URL(origen).host !== host) return nada();
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOTS.test(ua)) return nada();

  let datos: { ruta?: unknown; referente?: unknown };
  try {
    const texto = await req.text();
    if (texto.length > 500) return nada();
    datos = JSON.parse(texto);
  } catch {
    return nada();
  }
  const ruta = typeof datos.ruta === "string" ? datos.ruta.toLowerCase() : "";
  if (!RUTA.test(ruta) || ruta.length > 200 || ruta.startsWith("/admin") || ruta.startsWith("/dev")) return nada();

  // De dónde viene: solo el dominio, y solo si es de fuera (Instagram, Google…)
  let referente: string | null = null;
  if (typeof datos.referente === "string") {
    try {
      const h = new URL(datos.referente).hostname.toLowerCase().replace(/^www\./, "").replace(/^l\./, "");
      if (HOST.test(h) && h !== host.split(":")[0]) referente = h;
    } catch {
      // referente inválido: se ignora
    }
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const visitante = createHash("sha256").update(`${ip}|${ua}|${hoyEnMadrid()}|${SAL_VISITAS}`).digest("hex").slice(0, 16);
  const paisCabecera = (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase();

  await clienteContador()
    .from("visitas")
    .insert({ ruta, visitante, pais: /^[A-Z]{2}$/.test(paisCabecera) ? paisCabecera : null, dispositivo: dispositivo(ua), origen: referente });
  return nada();
}
