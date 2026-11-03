import type { TipoPercha } from "@/lib/coleccion";

// Perchas en SVG, en el mismo sistema de coordenadas que la prenda colgada: 1200 de ancho × 1800 de alto.
// La imagen de la prenda (1200×1500) empieza en y=300, así que su punto de enganche cae en y=300+enganche.
// La barra del perchero pasa por y=60: el gancho la abraza por arriba.
export const VIEWBOX = "0 0 1200 1800";
export const ALTO_CAJA = 1800;
export const INICIO_IMAGEN = 300;
export const Y_BARRA = 60;

/** Gancho común: baja hasta `hasta` (cuello de la camiseta o travesaño de las pinzas) */
const gancho = (hasta: number) => `M600 ${hasta} L600 204 C600 170 576 158 576 118 C576 76 604 48 633 51 C664 54 676 86 659 109`;

/** Degradados metálicos compartidos por todas las perchas (se pintan una sola vez en el perchero).
 *  En coordenadas de la caja (userSpaceOnUse): así también se pintan las líneas rectas, que no tienen alto o ancho. */
export function DefinicionesMetal() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="cga-metal" gradientUnits="userSpaceOnUse" x1="420" y1="0" x2="780" y2="620">
          <stop offset="0" stopColor="#e6e6e1" />
          <stop offset="0.45" stopColor="#9a9a96" />
          <stop offset="1" stopColor="#4c4c4a" />
        </linearGradient>
        <linearGradient id="cga-metal-pinza" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a5a57" />
          <stop offset="0.35" stopColor="#d9d9d4" />
          <stop offset="0.7" stopColor="#8f8f8b" />
          <stop offset="1" stopColor="#3f3f3d" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Capa de detrás: todo lo que queda por detrás de la prenda (gancho y cuerpo de la percha). */
export function PerchaDetras({ tipo }: { tipo: TipoPercha }) {
  return (
    <svg aria-hidden="true" viewBox={VIEWBOX} className="percha percha--detras" focusable="false">
      <g fill="none" stroke="url(#cga-metal)" strokeLinecap="round" strokeLinejoin="round">
        <path d={gancho(tipo === "camiseta" ? 440 : 412)} strokeWidth="15" />
        {tipo === "camiseta" ? (
          // Percha de alambre pequeña: nace dentro del cuello y los brazos quedan escondidos bajo los hombros
          <path d="M600 440 C598 448 592 452 584 456 L428 512 C406 520 410 538 432 538 L768 538 C790 538 794 520 772 512 L616 456 C608 452 602 448 600 440 Z" strokeWidth="11" />
        ) : (
          // Percha de pinzas: travesaño recto
          <>
            <path d="M336 412 L864 412" strokeWidth="16" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Capa de delante: las pinzas de los shorts muerden la cinturilla por encima de la prenda. */
export function PerchaDelante({ tipo }: { tipo: TipoPercha }) {
  if (tipo !== "short") return null;
  return (
    <svg aria-hidden="true" viewBox={VIEWBOX} className="percha percha--delante" focusable="false">
      {[384, 816].map((x) => (
        <g key={x}>
          <path d={`M${x} 412 L${x} 436`} stroke="url(#cga-metal)" strokeWidth="10" strokeLinecap="round" />
          <rect x={x - 26} y={436} width={52} height={78} rx={8} fill="url(#cga-metal-pinza)" stroke="#2a2a2a" strokeWidth="3" />
          <path d={`M${x - 16} 452 L${x + 16} 452`} stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}
