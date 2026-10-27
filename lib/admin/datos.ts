import "server-only";
import { adminParaAccion } from "./sesion";

export type FotoAdmin = { id: string; ruta_pequena: string; ruta_storage: string; alt: string; orden: number };
export type PrendaAdmin = {
  id: string;
  drop_id: string;
  nombre: string | null;
  categoria: string;
  descripcion: string | null;
  gramaje_g: number | null;
  linea: "general" | "woman" | "kids";
  agotado: boolean;
  publicado: boolean;
  orden: number;
  imagenes_producto: FotoAdmin[];
};
export type LanzamientoAdmin = {
  id: string;
  nombre_interno: string;
  estado: "proximo" | "activo" | "agotado";
  fecha_lanzamiento: string | null;
  acento: string;
  publicado: boolean;
  orden: number;
  productos: PrendaAdmin[];
};

const CAMPOS_PRENDA = "id, drop_id, nombre, categoria, descripcion, gramaje_g, linea, agotado, publicado, orden, imagenes_producto(id, ruta_pequena, ruta_storage, alt, orden)";

/** Todo lo del panel, leído con la sesión del admin (RLS: solo un admin con doble factor lo ve). */
export async function leerTodo(): Promise<LanzamientoAdmin[]> {
  const { supabase } = await adminParaAccion();
  const { data, error } = await supabase
    .from("drops")
    .select(`id, nombre_interno, estado, fecha_lanzamiento, acento, publicado, orden, productos(${CAMPOS_PRENDA})`)
    .order("orden")
    .order("created_at");
  if (error) throw new Error("No se han podido leer los datos");
  return (data as LanzamientoAdmin[]).map((d) => ({
    ...d,
    productos: [...d.productos].sort((a, b) => a.orden - b.orden).map((p) => ({ ...p, imagenes_producto: [...p.imagenes_producto].sort((a, b) => a.orden - b.orden) })),
  }));
}

export async function leerPrenda(id: string): Promise<PrendaAdmin | null> {
  const { supabase } = await adminParaAccion();
  const { data } = await supabase.from("productos").select(CAMPOS_PRENDA).eq("id", id).maybeSingle();
  if (!data) return null;
  const p = data as PrendaAdmin;
  return { ...p, imagenes_producto: [...p.imagenes_producto].sort((a, b) => a.orden - b.orden) };
}

export type Cambio = { id: number; email: string | null; accion: string; tabla: string; resumen: string | null; creado: string };

export async function leerActividad(limite = 100): Promise<Cambio[]> {
  const { supabase } = await adminParaAccion();
  const { data } = await supabase.from("registro").select("id, email, accion, tabla, resumen, creado").order("creado", { ascending: false }).limit(limite);
  return (data ?? []) as Cambio[];
}

/** Dónde se ve un lanzamiento en la web ahora mismo */
export function dondeSeVe(d: LanzamientoAdmin, ahora = Date.now()): "proximo" | "nuevo" | "ya-no-hay" | "oculto" {
  if (!d.publicado) return "oculto";
  if (d.estado === "agotado") return "ya-no-hay";
  if (d.estado === "proximo" && d.fecha_lanzamiento && new Date(d.fecha_lanzamiento).getTime() > ahora) return "proximo";
  return "nuevo";
}
