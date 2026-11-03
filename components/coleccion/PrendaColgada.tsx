import Image from "next/image";
import { forwardRef } from "react";
import { ALTO_IMAGEN, ANCHO_IMAGEN, type CaraPrenda, type PrendaColeccion, type TipoPercha } from "@/lib/coleccion";
import { ALTO_CAJA, INICIO_IMAGEN, PerchaDelante, PerchaDetras } from "./Percha";

/** Altura (en px de la imagen) a la que cada percha agarra la prenda. */
const ANCLA_Y: Record<TipoPercha, number> = { camiseta: 120, short: 160 };

/** Posición de la imagen dentro de la caja de la prenda colgada, para que su enganche caiga en la percha. */
export function estiloImagen(cara: CaraPrenda, tipo: TipoPercha): React.CSSProperties {
  const top = INICIO_IMAGEN + ANCLA_Y[tipo] - cara.engancheY;
  const left = ANCHO_IMAGEN / 2 - cara.engancheX;
  return {
    top: `${(top / ALTO_CAJA) * 100}%`,
    left: `${(left / ANCHO_IMAGEN) * 100}%`,
    width: "100%",
    height: `${(ALTO_IMAGEN / ALTO_CAJA) * 100}%`,
  };
}

/** Alto que necesita el perchero (en unidades de la caja) para que no se corte ninguna prenda: el bajo más largo + aire */
export function altoCaja(prendas: PrendaColeccion[]): number {
  const bajos = prendas.flatMap((p) =>
    [p.delante, p.detras].map((c) => INICIO_IMAGEN + ANCLA_Y[p.tipo] - c.engancheY + p.caja[3]),
  );
  return Math.ceil(Math.max(...bajos, 900) + 60);
}

/** Zona que responde al clic: solo donde está la prenda (las cajas se solapan en el perchero) */
function estiloZona(prenda: PrendaColeccion): React.CSSProperties {
  const [x0, , x1, y1] = prenda.caja;
  const dx = ANCHO_IMAGEN / 2 - prenda.delante.engancheX;
  const dy = INICIO_IMAGEN + ANCLA_Y[prenda.tipo] - prenda.delante.engancheY;
  // Desde el gancho (y=20) hasta el bajo de la prenda, para poder pinchar también en la percha
  const arriba = 20;
  return {
    left: `${((x0 + dx) / ANCHO_IMAGEN) * 100}%`,
    width: `${((x1 - x0) / ANCHO_IMAGEN) * 100}%`,
    top: `${(arriba / ALTO_CAJA) * 100}%`,
    height: `${((y1 + dy - arriba) / ALTO_CAJA) * 100}%`,
  };
}

/** Desfase y duración del balanceo de cada prenda: fijos por posición (sin aleatorio real, para no romper la hidratación). */
function ritmo(indice: number): React.CSSProperties {
  const duracion = 4.2 + ((indice * 7) % 5) * 0.35;
  const desfase = ((indice * 1.618) % 1) * duracion;
  return { "--balanceo-duracion": `${duracion}s`, "--balanceo-desfase": `-${desfase.toFixed(2)}s` } as React.CSSProperties;
}

type Props = {
  prenda: PrendaColeccion;
  indice: number;
  activa: boolean;
  oculta: boolean;
  prioridad: boolean;
  /** Primera pieza de su equipación: deja aire con la anterior y lleva la etiqueta del conjunto */
  inicioEquipo: boolean;
  onAbrir: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
};

/** Una prenda en su percha. Es un botón: se abre con clic, Enter o Espacio. */
export const PrendaColgada = forwardRef<HTMLButtonElement, Props>(function PrendaColgada(
  { prenda, indice, activa, oculta, prioridad, inicioEquipo, onAbrir, onKeyDown },
  ref,
) {
  const nombre = prenda.nombre ?? "Prenda sin nombre todavía";
  return (
    <li className="colgada" style={ritmo(indice)} data-slug={prenda.slug} data-inicio-equipo={inicioEquipo && indice > 0 ? "" : undefined}>
      <button
        ref={ref}
        type="button"
        className="colgada__boton"
        aria-label={`${nombre}. Ver de cerca, por delante y por detrás`}
        aria-haspopup="dialog"
        tabIndex={activa ? 0 : -1}
        onClick={onAbrir}
        onKeyDown={onKeyDown}
      >
        <span className="colgada__balanceo" data-oculta={oculta || undefined}>
          <PerchaDetras tipo={prenda.tipo} />
          <span className="colgada__imagen" style={estiloImagen(prenda.delante, prenda.tipo)} data-imagen-origen>
            <Image
              src={prenda.delante.src}
              alt=""
              width={ANCHO_IMAGEN}
              height={ALTO_IMAGEN}
              sizes="(min-width: 1024px) 460px, (min-width: 768px) 440px, 92vw"
              priority={prioridad}
              draggable={false}
            />
          </span>
          <PerchaDelante tipo={prenda.tipo} />
          <span className="colgada__zona" style={estiloZona(prenda)} />
          {prenda.etiqueta && inicioEquipo ? (
            <span className="colgada__etiqueta" aria-hidden="true">
              <span className="colgada__hilo" />
              <span className="colgada__carton">{prenda.etiqueta}</span>
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
});
