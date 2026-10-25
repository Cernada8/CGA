import Link from "next/link";
import { Insignia } from "@/components/ui/Logo";
import { generar } from "@/lib/laberinto";
import { INSTAGRAM_URL } from "@/lib/marca";
import { PuertaControl } from "./PuertaControl";

const LETRAS = [
  { letra: "C", palabra: "Constancia" },
  { letra: "G", palabra: "Ganas" },
  { letra: "A", palabra: "Actitud" },
] as const;

/** Laberinto decorativo del fondo de la intro (se genera en el servidor: cero JS). */
function FondoLaberinto() {
  const l = generar(12, 9, 2021);
  const t = 10;
  let d = "";
  for (let y = 0; y < l.filas; y++) {
    for (let x = 0; x < l.columnas; x++) {
      const p = l.pasos[y * l.columnas + x];
      if (!(p & 1)) d += `M${x * t} ${y * t}h${t}`;
      if (!(p & 8)) d += `M${x * t} ${y * t}v${t}`;
    }
  }
  d += `M${l.columnas * t} 0v${(l.filas - 1) * t}M0 ${l.filas * t}h${l.columnas * t}`;
  return (
    <svg aria-hidden="true" viewBox={`-2 -2 ${l.columnas * t + 4} ${l.filas * t + 4}`} className="puerta__fondo-laberinto">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Puerta de entrada de la home: solo entra quien supera las tres pruebas (Constancia, Ganas, Actitud).
 * - Este marco es HTML de servidor, oculto por CSS. El script del <head> añade html.con-puerta antes de pintar
 *   si toca mostrarla (primera visita en ese navegador, sin ?entrar=directo, con almacenamiento usable).
 * - Todo el contenido de la web sigue en el HTML debajo: la puerta es solo una capa.
 * - La parte interactiva (PuertaControl) pesa muy poco; las pruebas y GSAP se cargan aparte.
 */
export function Puerta() {
  return (
    <div id="puerta" role="dialog" aria-modal="true" aria-labelledby="puerta-titulo" data-fase="intro" className="puerta grano">
      <div className="puerta__marco">
        <div className="puerta__barra">
          <Insignia tamano={40} alt="CGA Training Hard" />
          <ol className="puerta__letras" aria-label="Pruebas">
            {LETRAS.map(({ letra, palabra }, i) => (
              <li key={letra} data-letra={i} data-estado="pendiente">
                <span aria-hidden="true">{letra}</span>
                <span className="sr-only">
                  {palabra}: <span data-letra-estado>pendiente</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="puerta__escena">
          <div className="puerta__intro">
            <FondoLaberinto />
            <h2 id="puerta-titulo" className="puerta__titulo font-grito">
              No entra cualquiera.
            </h2>
            <p className="mt-8 max-w-md text-lg text-blanco/90 sm:text-xl lg:mt-12">
              Tres pruebas: Constancia, Ganas y Actitud. Si de verdad te interesa, pasa.
            </p>
            <PuertaControl />
          </div>
          <div id="puerta-juego" className="puerta__juego" />
        </div>

        <p className="puerta__pie">
          <span>
            ¿Eres una marca o una academia?{" "}
            <Link href="/colaboraciones" className="puerta__enlace">
              Entra por colaboraciones
            </Link>
          </span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="puerta__enlace">
            @cga.training.hard
            <span className="sr-only"> (se abre en Instagram)</span>
          </a>
        </p>
      </div>
    </div>
  );
}
