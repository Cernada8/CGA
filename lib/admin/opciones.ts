import "server-only";
import type { OpcionLanzamiento } from "@/components/admin/FormPrenda";
import { dondeSeVe, type LanzamientoAdmin } from "./datos";
import { fechaLarga } from "./fechas";

const GRUPO = { proximo: "Lo próximo (con cuenta atrás)", nuevo: "Lo nuevo (ya en la web)", "ya-no-hay": "Ya no hay", oculto: "Ocultos" } as const;

export function opcionesLanzamiento(lista: LanzamientoAdmin[]): OpcionLanzamiento[] {
  return lista.map((d) => {
    const donde = dondeSeVe(d);
    return {
      id: d.id,
      grupo: GRUPO[donde],
      texto: donde === "proximo" && d.fecha_lanzamiento ? `${d.nombre_interno} · sale el ${fechaLarga(d.fecha_lanzamiento)}` : d.nombre_interno,
    };
  });
}
