import Link from "next/link";
import { salir } from "@/app/admin/acceso/acciones";
import { Insignia } from "@/components/ui/Logo";

const ENLACES = [
  { href: "/admin", texto: "Inicio" },
  { href: "/admin/actividad", texto: "Actividad" },
  { href: "/admin/cuenta", texto: "Tu cuenta" },
];

/** Estructura del panel: barra superior con navegación, «Ver la web» y «Salir». */
export function Marco({ children, titulo, volver }: { children: React.ReactNode; titulo: string; volver?: { href: string; texto: string } }) {
  return (
    <div className="adm">
      <header className="adm-barra">
        <div className="adm-barra__dentro">
          <Link href="/admin" className="adm-marca" aria-label="Panel de CGA, inicio">
            <Insignia tamano={36} alt="" />
            <span>Panel</span>
          </Link>
          <nav aria-label="Panel" className="adm-nav">
            {ENLACES.map((e) => (
              <Link key={e.href} href={e.href} className="adm-nav__enlace">
                {e.texto}
              </Link>
            ))}
            <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav__enlace">
              Ver la web
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </nav>
          <form action={salir}>
            <button type="submit" className="adm-salir">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main id="contenido" className="adm-contenido">
        {volver ? (
          <Link href={volver.href} className="adm-volver">
            ← {volver.texto}
          </Link>
        ) : null}
        <h1 className="adm-titulo">{titulo}</h1>
        {children}
      </main>
    </div>
  );
}

/** Pantalla centrada para los pasos de acceso. */
export function PantallaAcceso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main id="contenido" className="adm-acceso">
      <div className="adm-acceso__tarjeta">
        <div className="adm-acceso__marca">
          <Insignia tamano={56} alt="CGA Training Hard" />
        </div>
        <h1 className="adm-acceso__titulo">{titulo}</h1>
        {children}
      </div>
    </main>
  );
}
