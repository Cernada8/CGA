import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Proxy del panel (/admin): refresca la sesión, cierra por inactividad y marca todo como no cacheable ni indexable.
const MINUTOS_INACTIVIDAD = 30;
const COOKIE_ACTIVIDAD = "cga_admin_actividad";
const RUTAS_LIBRES = ["/admin/entrar"];

const opciones = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
};

export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (url && clave) {
    const supabase = createServerClient(url, clave, {
      cookieOptions: opciones,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista) => {
          for (const { name, value } of lista) request.cookies.set(name, value);
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of lista) respuesta.cookies.set(name, value, { ...options, ...opciones });
        },
      },
    });
    // Refresca el token si hace falta (getClaims valida la firma del JWT)
    const { data } = await supabase.auth.getClaims();
    const conSesion = Boolean(data?.claims?.sub);

    if (conSesion) {
      const ahora = Date.now();
      const ultima = Number(request.cookies.get(COOKIE_ACTIVIDAD)?.value ?? ahora);
      if (ahora - ultima > MINUTOS_INACTIVIDAD * 60_000) {
        await supabase.auth.signOut();
        const salir = NextResponse.redirect(new URL("/admin/entrar?motivo=inactividad", request.url));
        for (const c of respuesta.cookies.getAll()) salir.cookies.set(c);
        salir.cookies.delete({ name: COOKIE_ACTIVIDAD, path: "/admin" });
        return marcar(salir);
      }
      respuesta.cookies.set(COOKIE_ACTIVIDAD, String(ahora), { ...opciones, maxAge: 60 * 60 * 12 });
    } else if (!RUTAS_LIBRES.includes(request.nextUrl.pathname)) {
      respuesta.cookies.delete({ name: COOKIE_ACTIVIDAD, path: "/admin" });
    }
  }
  return marcar(respuesta);
}

function marcar(r: NextResponse) {
  r.headers.set("Cache-Control", "no-store, max-age=0");
  r.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  r.headers.set("Referrer-Policy", "no-referrer");
  return r;
}

export const config = { matcher: ["/admin/:path*", "/admin"] };
