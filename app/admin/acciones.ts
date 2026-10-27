"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminParaAccion } from "@/lib/admin/sesion";
import { madridAIso } from "@/lib/admin/fechas";
import { ACENTOS, CATEGORIAS, casilla, entero, LINEAS, texto, unoDe, uuid, type Resultado } from "@/lib/admin/validar";
import { contraste, NEGRO_BASE } from "@/lib/tema";

const NO_AUTORIZADO: Resultado = { ok: false, mensaje: "Tu sesión ha caducado. Vuelve a entrar." };
const FALLO: Resultado = { ok: false, mensaje: "No se ha podido guardar. Inténtalo de nuevo en un momento." };

/** Comprueba que es un admin completo (contraseña + móvil). Cualquier fallo, fuera. */
async function admin() {
  try {
    return await adminParaAccion();
  } catch {
    return null;
  }
}

function publicar(...rutas: string[]) {
  revalidatePath("/", "layout");
  for (const r of rutas) revalidatePath(r);
}

// ---------- Lanzamientos ----------

const ESTADOS = ["proximo", "activo", "agotado"] as const;

export async function guardarLanzamiento(_p: Resultado | null, fd: FormData): Promise<Resultado> {
  const a = await admin();
  if (!a) return NO_AUTORIZADO;
  const id = uuid(fd, "id");
  const nombre = texto(fd, "nombre", 80);
  const estado = unoDe(fd, "estado", ESTADOS, "activo");
  const publicado = casilla(fd, "publicado");
  const errores: Record<string, string> = {};

  if (!nombre) errores.nombre = "Ponle un nombre para reconocerlo (solo lo ves tú).";

  let fecha: string | null = null;
  if (estado === "proximo") {
    fecha = madridAIso(texto(fd, "fecha", 10), texto(fd, "hora", 5));
    if (!fecha) errores.fecha = "Elige el día y la hora de salida.";
    else if (new Date(fecha).getTime() < Date.now() - 60_000 && !id) errores.fecha = "Esa fecha ya ha pasado. Elige una futura.";
  }

  let acento = texto(fd, "acento", 7).toLowerCase();
  if (acento === "otro") acento = texto(fd, "acentoPropio", 7).toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(acento)) errores.acento = "Elige un color.";
  else if (!ACENTOS.some((x) => x.valor === acento) && contraste(acento, NEGRO_BASE) < 4.5) {
    errores.acento = `Ese color se lee mal sobre negro (contraste ${contraste(acento, NEGRO_BASE)}:1, mínimo 4,5:1). Elige uno más claro.`;
  }
  if (Object.keys(errores).length) return { ok: false, mensaje: "Revisa los campos marcados.", errores };

  const fila = { nombre_interno: nombre, estado, fecha_lanzamiento: fecha, acento, publicado };
  const r = id
    ? await a.supabase.from("drops").update(fila).eq("id", id).select("id").single()
    : await a.supabase.from("drops").insert(fila).select("id").single();
  if (r.error || !r.data) return FALLO;
  publicar("/admin");
  if (!id) redirect(`/admin/lanzamientos/${r.data.id}?creado=1`);
  return { ok: true, mensaje: "Guardado. Ya está en la web.", id: r.data.id };
}

export async function borrarLanzamiento(_p: Resultado | null, fd: FormData): Promise<Resultado> {
  const a = await admin();
  if (!a) return NO_AUTORIZADO;
  const id = uuid(fd, "id");
  if (!id || texto(fd, "confirmar", 10) !== "BORRAR") return { ok: false, mensaje: "Escribe BORRAR para confirmar." };
  const { data: fotos } = await a.supabase.from("imagenes_producto").select("ruta_storage, ruta_pequena, productos!inner(drop_id)").eq("productos.drop_id", id);
  const { error } = await a.supabase.from("drops").delete().eq("id", id);
  if (error) return FALLO;
  const rutas = (fotos ?? []).flatMap((f) => [f.ruta_storage, f.ruta_pequena]);
  if (rutas.length) await a.supabase.storage.from("prendas").remove(rutas);
  publicar("/admin");
  redirect("/admin?borrado=1");
}

// ---------- Prendas ----------

export async function guardarPrenda(_p: Resultado | null, fd: FormData): Promise<Resultado> {
  const a = await admin();
  if (!a) return NO_AUTORIZADO;
  const id = uuid(fd, "id");
  const dropId = uuid(fd, "drop_id");
  const nombre = texto(fd, "nombre", 80);
  const gramaje = entero(fd, "gramaje", 50, 1000);
  const errores: Record<string, string> = {};
  if (!dropId) errores.drop_id = "Elige dónde va la prenda.";
  if (!nombre) errores.nombre = "Escribe el nombre de la prenda.";
  if (gramaje === "invalido") errores.gramaje = "Solo números, entre 50 y 1000 (o déjalo vacío).";
  if (Object.keys(errores).length) return { ok: false, mensaje: "Revisa los campos marcados.", errores };

  const fila = {
    drop_id: dropId!,
    nombre,
    categoria: unoDe(fd, "categoria", CATEGORIAS, "Otra"),
    descripcion: texto(fd, "descripcion", 400) || null,
    gramaje_g: gramaje === "invalido" ? null : gramaje,
    linea: unoDe(fd, "linea", LINEAS.map((l) => l.valor), "general"),
    agotado: casilla(fd, "agotado"),
    publicado: casilla(fd, "publicado"),
  };
  let r;
  if (id) {
    r = await a.supabase.from("productos").update(fila).eq("id", id).select("id").single();
  } else {
    const { data: ultimo } = await a.supabase.from("productos").select("orden").eq("drop_id", dropId!).order("orden", { ascending: false }).limit(1).maybeSingle();
    r = await a.supabase.from("productos").insert({ ...fila, orden: (ultimo?.orden ?? 0) + 1 }).select("id").single();
  }
  if (r.error || !r.data) return FALLO;
  publicar("/admin");
  if (!id) redirect(`/admin/prendas/${r.data.id}?creada=1`);
  return { ok: true, mensaje: "Guardado. Ya está en la web.", id: r.data.id };
}

export async function borrarPrenda(_p: Resultado | null, fd: FormData): Promise<Resultado> {
  const a = await admin();
  if (!a) return NO_AUTORIZADO;
  const id = uuid(fd, "id");
  if (!id) return FALLO;
  const { data: fotos } = await a.supabase.from("imagenes_producto").select("ruta_storage, ruta_pequena").eq("producto_id", id);
  const { error } = await a.supabase.from("productos").delete().eq("id", id);
  if (error) return FALLO;
  const rutas = (fotos ?? []).flatMap((f) => [f.ruta_storage, f.ruta_pequena]);
  if (rutas.length) await a.supabase.storage.from("prendas").remove(rutas);
  publicar("/admin");
  redirect("/admin?borrada=1");
}

/** Interruptor rápido desde el inicio del panel: «Se ha agotado» / «Vuelve a estar» (por error). */
export async function marcarAgotada(fd: FormData): Promise<void> {
  const a = await admin();
  if (!a) redirect("/admin/entrar");
  const id = uuid(fd, "id");
  if (!id) return;
  await a.supabase.from("productos").update({ agotado: casilla(fd, "agotado") }).eq("id", id);
  publicar("/admin");
}

// ---------- Fotos ----------

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FOTOS = 8;

function tipoReal(b: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "webp";
  return null;
}

/**
 * Sube una foto. Se comprueba qué es de verdad (no por la extensión), se vuelve a generar desde cero
 * en WebP (eso borra datos ocultos como la ubicación GPS del móvil y cualquier contenido extraño)
 * y se guarda en dos tamaños con un nombre aleatorio.
 */
export async function subirFoto(_p: Resultado | null, fd: FormData): Promise<Resultado> {
  const a = await admin();
  if (!a) return NO_AUTORIZADO;
  const productoId = uuid(fd, "producto_id");
  const alt = texto(fd, "alt", 200);
  const archivo = fd.get("archivo");
  if (!productoId) return FALLO;
  if (!(archivo instanceof File) || archivo.size === 0) return { ok: false, mensaje: "Elige una foto." };
  if (archivo.size > MAX_BYTES) return { ok: false, mensaje: "La foto pesa más de 10 MB. Prueba con otra o hazle una captura." };
  if (alt.length < 3) return { ok: false, mensaje: "Describe la foto en pocas palabras (por ejemplo: «Sudadera negra con el gorila en la espalda»)." };

  const { count } = await a.supabase.from("imagenes_producto").select("id", { count: "exact", head: true }).eq("producto_id", productoId);
  if ((count ?? 0) >= MAX_FOTOS) return { ok: false, mensaje: `Cada prenda admite ${MAX_FOTOS} fotos como mucho.` };

  const entrada = new Uint8Array(await archivo.arrayBuffer());
  if (!tipoReal(entrada)) return { ok: false, mensaje: "Ese archivo no es una foto JPG, PNG o WebP." };

  const sharp = (await import("sharp")).default;
  let grande: { data: Buffer; info: { width: number; height: number } };
  let pequena: Buffer;
  try {
    const base = sharp(entrada, { limitInputPixels: 40_000_000, failOn: "error" }).rotate();
    grande = await base.clone().resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    pequena = await base.clone().resize({ width: 640, height: 800, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
  } catch {
    return { ok: false, mensaje: "No se ha podido leer la foto. Prueba con otra." };
  }

  const nombre = randomUUID();
  const ruta = `${productoId}/${nombre}.webp`;
  const rutaPequena = `${productoId}/${nombre}-p.webp`;
  const almacen = a.supabase.storage.from("prendas");
  const s1 = await almacen.upload(ruta, grande.data, { contentType: "image/webp", upsert: false });
  const s2 = s1.error ? s1 : await almacen.upload(rutaPequena, pequena, { contentType: "image/webp", upsert: false });
  if (s1.error || s2.error) {
    await almacen.remove([ruta, rutaPequena]);
    return FALLO;
  }
  const { data: ultima } = await a.supabase.from("imagenes_producto").select("orden").eq("producto_id", productoId).order("orden", { ascending: false }).limit(1).maybeSingle();
  const { error } = await a.supabase.from("imagenes_producto").insert({
    producto_id: productoId,
    ruta_storage: ruta,
    ruta_pequena: rutaPequena,
    ancho: grande.info.width,
    alto: grande.info.height,
    alt,
    orden: (ultima?.orden ?? 0) + 1,
  });
  if (error) {
    await almacen.remove([ruta, rutaPequena]);
    return FALLO;
  }
  publicar("/admin", `/admin/prendas/${productoId}`);
  return { ok: true, mensaje: "Foto subida." };
}

export async function borrarFoto(fd: FormData): Promise<void> {
  const a = await admin();
  if (!a) redirect("/admin/entrar");
  const id = uuid(fd, "id");
  if (!id) return;
  const { data: foto } = await a.supabase.from("imagenes_producto").select("producto_id, ruta_storage, ruta_pequena").eq("id", id).maybeSingle();
  if (!foto) return;
  const { error } = await a.supabase.from("imagenes_producto").delete().eq("id", id);
  if (!error) await a.supabase.storage.from("prendas").remove([foto.ruta_storage, foto.ruta_pequena]);
  publicar(`/admin/prendas/${foto.producto_id}`);
}

export async function moverFoto(fd: FormData): Promise<void> {
  const a = await admin();
  if (!a) redirect("/admin/entrar");
  const id = uuid(fd, "id");
  const hacia = texto(fd, "hacia", 10);
  if (!id || (hacia !== "antes" && hacia !== "despues")) return;
  const { data: foto } = await a.supabase.from("imagenes_producto").select("producto_id").eq("id", id).maybeSingle();
  if (!foto) return;
  const { data: todas } = await a.supabase.from("imagenes_producto").select("id, orden").eq("producto_id", foto.producto_id).order("orden");
  const lista = todas ?? [];
  const i = lista.findIndex((f) => f.id === id);
  const j = hacia === "antes" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  await Promise.all(lista.map((f, k) => a.supabase.from("imagenes_producto").update({ orden: k + 1 }).eq("id", f.id)));
  publicar(`/admin/prendas/${foto.producto_id}`);
}
