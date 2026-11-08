import Link from "next/link";
import { redirect } from "next/navigation";
import { Estadisticas } from "@/components/admin/Estadisticas";
import { Aviso } from "@/components/admin/ui";
import { Insignia } from "@/components/ui/Logo";
import { RANGOS } from "@/lib/admin/visitas";
import { haySesionVisor, leerResumenVisor } from "@/lib/visor";
import { salirVisor } from "../acciones";

export const metadata = { title: "Visitas" };

// Solo ver: las visitas y nada más (sin menú del panel ni ninguna acción que cambie algo)
export default async function VisitasVisor({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  if (!(await haySesionVisor())) redirect("/admin/visor");
  const pedido = Number((await searchParams).dias);
  const dias = (RANGOS as readonly number[]).includes(pedido) ? pedido : 30;
  const resumen = await leerResumenVisor(dias);
  return (
    <div className="adm">
      <header className="adm-barra">
        <div className="adm-barra__dentro">
          <Link href="/admin/visor/visitas" className="adm-marca" aria-label="Visitas de CGA">
            <Insignia tamano={36} alt="" />
            <span>Visitas</span>
          </Link>
          <form action={salirVisor}>
            <button type="submit" className="adm-salir">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main id="contenido" className="adm-contenido">
        <h1 className="adm-titulo">Visitas a la web</h1>
        {resumen ? (
          <Estadisticas resumen={resumen} rangos={RANGOS} ruta="/admin/visor/visitas" />
        ) : (
          <Aviso ok={false}>No se han podido leer las visitas. Inténtalo de nuevo en un momento.</Aviso>
        )}
      </main>
    </div>
  );
}
