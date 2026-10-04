import Link from "next/link";
import { MarcaTexto } from "@/components/ui/Logo";
import { EMAIL_CONTACTO, INSTAGRAM_URL, INSTAGRAM_USUARIO } from "@/lib/marca";

export function Pie({ bordeSuperior = true }: { bordeSuperior?: boolean }) {
  return (
    <footer className={`${bordeSuperior ? "border-t border-gris-oscuro" : ""}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div className="flex items-center gap-5">
          <MarcaTexto variante="vertical" ancho={64} className="text-blanco" />
          <p className="font-sello text-2xl leading-tight">Siempre humildes, nunca sumisos.</p>
        </div>
        <ul className="space-y-2 text-base">
          <li>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-acento hover:underline">
              Instagram: @{INSTAGRAM_USUARIO}
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${EMAIL_CONTACTO}`} className="underline-offset-4 hover:text-acento hover:underline">
              {EMAIL_CONTACTO}
            </a>
          </li>
          <li>
            <Link href="/colaboraciones" className="underline-offset-4 hover:text-acento hover:underline">
              Colaboraciones
            </Link>
          </li>
        </ul>
        <div className="space-y-2 text-sm text-gris md:text-right">
          <p>Hecho con Patch4Gi.</p>
          <p>© {new Date().getFullYear()} CGA Training Hard</p>
        </div>
      </div>
    </footer>
  );
}
