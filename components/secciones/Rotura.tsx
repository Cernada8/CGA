import Image from "next/image";
import { BORDE, ESCOMBROS_ATRAS, ESCOMBROS_DELANTE, type Escombro, GRIETAS, HUECO } from "./rotura-datos";

// El gorila rompiendo la pared entre dos secciones: hueco con borde de hormigón roto,
// grietas que recorren ambas secciones y escombros (unos detrás y otros delante del gorila).
// Todo es SVG y CSS. Si el navegador soporta animaciones ligadas al scroll, el gorila «sale»
// al entrar en pantalla; si no, o con movimiento reducido, se ve la escena quieta.

const UNIDADES_GORILA = 240; // ancho del gorila en el viewBox

type Props = {
  ancho: string;
  sizes: string;
  arriba: string;
  abajo: string;
  margen?: string;
};

function Escombros({ lista, clase }: { lista: Escombro[]; clase: string }) {
  return (
    <g className={clase}>
      {lista.map((e, i) => (
        <path
          key={i}
          d={e.d}
          className="rotura__escombro"
        />
      ))}
    </g>
  );
}

export function Rotura({ ancho, sizes, arriba, abajo, margen = "" }: Props) {
  const anchoSvg = `calc(${ancho} * ${1000 / UNIDADES_GORILA})`;
  const capa = "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
  return (
    <div
      className={`rotura relative isolate z-10 grid place-items-center overflow-clip ${margen}`}
      style={{ height: `calc(${ancho} * 1.6)` }}
    >
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 -z-10 h-1/2 ${arriba}`} />
      <div aria-hidden="true" className={`absolute inset-x-0 bottom-0 -z-10 h-1/2 border-t border-gris-oscuro ${abajo}`} />

      <svg aria-hidden="true" viewBox="0 0 1000 420" className={`${capa} rotura__pared`} style={{ width: anchoSvg }}>
        <defs>
          <radialGradient id="rotura-hueco" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#000" />
            <stop offset="70%" stopColor="#030303" />
            <stop offset="100%" stopColor="#111" />
          </radialGradient>
          <linearGradient id="rotura-borde" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#1c1c1c" />
          </linearGradient>
        </defs>
        <g className="rotura__grietas" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {GRIETAS.map((d, i) => (
            <g key={i}>
              <path d={d} pathLength={1} stroke="#000" strokeWidth={i % 3 === 0 ? 2.6 : 1.6} />
              <path d={d} pathLength={1} stroke="rgba(255,255,255,0.09)" strokeWidth={0.9} transform="translate(0.9 1.1)" />
            </g>
          ))}
        </g>
        <path d={BORDE} fill="url(#rotura-borde)" stroke="#000" strokeWidth={1.5} strokeLinejoin="round" />
        <path d={BORDE} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} transform="translate(0 -1)" />
        <path d={HUECO} fill="url(#rotura-hueco)" />
        <path d={HUECO} fill="none" stroke="#000" strokeWidth={8} strokeOpacity={0.85} />
      </svg>

      <svg aria-hidden="true" viewBox="0 0 1000 420" className={`${capa} rotura__capa-escombros`} style={{ width: anchoSvg }}>
        <Escombros lista={ESCOMBROS_ATRAS} clase="rotura__escombros" />
      </svg>

      <Image
        src="/grafiti/gorila.webp"
        alt="Grafiti del gorila de CGA con gorra roja y camiseta con el número 1, atravesando la pared de la web entre escombros"
        width={1000}
        height={1033}
        sizes={sizes}
        className="rotura__gorila relative h-auto"
        style={{ width: ancho }}
      />

      <svg aria-hidden="true" viewBox="0 0 1000 420" className={`${capa} rotura__capa-escombros`} style={{ width: anchoSvg }}>
        <Escombros lista={ESCOMBROS_DELANTE} clase="rotura__escombros rotura__escombros--delante" />
      </svg>
    </div>
  );
}
