import "server-only";
import { clienteAdmin } from "@/lib/supabase/admin";

export type Cuenta = { clave: string; total: number };
export type Resumen = {
  dias: number;
  visitas: number;
  visitantes: number;
  hoy: number;
  visitantes_hoy: number;
  por_dia: { dia: string; visitas: number; visitantes: number }[];
  paginas: Cuenta[];
  paises: Cuenta[];
  dispositivos: Cuenta[];
  origenes: Cuenta[];
};

export const RANGOS = [7, 30, 90] as const;

/** Resumen ya agregado en Supabase (función resumen_visitas; RLS: solo admins con doble factor) */
export async function leerResumen(dias: number): Promise<Resumen | null> {
  const supabase = await clienteAdmin();
  const { data, error } = await supabase.rpc("resumen_visitas", { p_dias: dias });
  if (error || !data) return null;
  return data as Resumen;
}
