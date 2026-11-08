import { notFound } from "next/navigation";
import { Estadisticas } from "@/components/admin/Estadisticas";
import { Marco } from "@/components/admin/Marco";
import type { Resumen } from "@/lib/admin/visitas";
import "../../admin/panel.css";

// Vista previa del panel de visitas con datos INVENTADOS de ejemplo (solo para revisar el diseño).
// Solo en local o con CGA_RUTAS_DEV=1, como el resto de /dev. Nunca se enseña como dato real.
export const dynamic = "force-dynamic";
export const metadata = { title: "Vista previa: visitas", robots: { index: false, follow: false } };

export default function Vista() {
  if (process.env.NODE_ENV === "production" && process.env.CGA_RUTAS_DEV !== "1") notFound();
  const hoy = new Date();
  const por_dia = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (29 - i));
    const visitas = Math.round(40 + 30 * Math.sin(i / 3) + i * 2 + (i % 7 === 5 ? 40 : 0));
    return { dia: d.toISOString().slice(0, 10), visitas, visitantes: Math.round(visitas * 0.62) };
  });
  const resumen: Resumen = {
    dias: 30,
    visitas: por_dia.reduce((t, d) => t + d.visitas, 0),
    visitantes: por_dia.reduce((t, d) => t + d.visitantes, 0),
    hoy: por_dia.at(-1)!.visitas,
    visitantes_hoy: por_dia.at(-1)!.visitantes,
    por_dia,
    paginas: [
      { clave: "/", total: 980 },
      { clave: "/colaboraciones", total: 210 },
      { clave: "/prenda/camiseta-oversize-gorila", total: 160 },
      { clave: "/prenda/sudadera-negra", total: 95 },
    ],
    paises: [
      { clave: "ES", total: 640 },
      { clave: "AO", total: 70 },
      { clave: "PT", total: 31 },
      { clave: "??", total: 9 },
    ],
    dispositivos: [
      { clave: "movil", total: 610 },
      { clave: "ordenador", total: 120 },
      { clave: "tableta", total: 20 },
    ],
    origenes: [
      { clave: "instagram.com", total: 420 },
      { clave: "directo", total: 230 },
      { clave: "google.com", total: 80 },
      { clave: "wa.me", total: 20 },
    ],
  };
  return (
    <Marco titulo="Visitas a la web (ejemplo)">
      <Estadisticas resumen={resumen} rangos={[7, 30, 90]} />
    </Marco>
  );
}
