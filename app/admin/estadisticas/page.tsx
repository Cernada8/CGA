import { Estadisticas } from "@/components/admin/Estadisticas";
import { Marco } from "@/components/admin/Marco";
import { Aviso } from "@/components/admin/ui";
import { requerirAdmin } from "@/lib/admin/sesion";
import { leerResumen, RANGOS } from "@/lib/admin/visitas";

export const metadata = { title: "Visitas" };

export default async function PaginaEstadisticas({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  await requerirAdmin();
  const pedido = Number((await searchParams).dias);
  const dias = (RANGOS as readonly number[]).includes(pedido) ? pedido : 30;
  const resumen = await leerResumen(dias);
  return (
    <Marco titulo="Visitas a la web">
      {resumen ? (
        <Estadisticas resumen={resumen} rangos={RANGOS} />
      ) : (
        <Aviso ok={false}>No se han podido leer las visitas. Inténtalo de nuevo en un momento.</Aviso>
      )}
    </Marco>
  );
}
