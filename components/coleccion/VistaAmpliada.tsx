"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ALTO_IMAGEN, ANCHO_IMAGEN, SIZES_VISTA, type CaraPrenda, type PrendaColeccion } from "@/lib/coleccion";
import { cargarMotor } from "@/lib/gsap-cliente";
import { INSTAGRAM_DM_URL } from "@/lib/marca";
import { CURVA, DURACION } from "@/lib/motion";

type Props = {
  prenda: PrendaColeccion;
  /** Imagen de la prenda en su percha: de ahí sale y ahí vuelve. Null si se abre desde un enlace. */
  origen: (() => HTMLElement | null) | null;
  onOcultarOrigen: (oculto: boolean) => void;
  onCerrada: () => void;
  /** Se llega desde la otra pieza de la equipación: sin viaje desde la percha, solo cambia la prenda */
  cambio: boolean;
  /** Abierta con el teclado: el foco va al botón de cerrar (visible). Con el dedo, a la vista entera (sin recuadros) */
  conTeclado: boolean;
  /** La otra pieza de la misma equipación (rashguard ↔ short) */
  pareja: PrendaColeccion | null;
  onVerPieza: (slug: string) => void;
  /** Le da al perchero la forma de cerrar animando (para el botón «atrás» del navegador) */
  registrarCierre: (cerrar: () => void) => void;
};

/** Distancia (px) que hay que deslizar hacia abajo para cerrar en el móvil */
const UMBRAL_CIERRE = 110;
const ANCLA_Y = { camiseta: 120, short: 160 } as const;

const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Prenda ampliada en un <dialog> modal (foco atrapado, Esc para cerrar, el resto de la página inerte).
 * Animación compartida hecha a mano (FLIP con GSAP): la imagen sale del rectángulo de la percha y crece
 * hasta su sitio; al cerrar hace el camino inverso. Solo se anima transform y opacity.
 */
export function VistaAmpliada({ prenda, origen, cambio, conTeclado, pareja, onVerPieza, onOcultarOrigen, onCerrada, registrarCierre }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const lienzo = useRef<HTMLDivElement>(null);
  const caras = useRef<HTMLDivElement>(null);
  const contenido = useRef<HTMLDivElement>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const cerrando = useRef(false);
  const [cara, setCara] = useState<"delante" | "detras">("delante");
  const [girando, setGirando] = useState(false);

  const [x0, y0, x1, y1] = prenda.caja;
  const idTitulo = `vista-${prenda.slug}`;

  /** Diferencia entre el rectángulo de la percha y el de la vista grande, como transform de GSAP */
  const desdeOrigen = useCallback(() => {
    const el = origen?.();
    if (!el || !lienzo.current) return null;
    const o = el.getBoundingClientRect();
    const l = lienzo.current.getBoundingClientRect();
    if (!l.width) return null;
    return { x: o.left - l.left, y: o.top - l.top, scale: o.width / l.width };
  }, [origen]);

  // Entrada
  useLayoutEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    d.showModal();
    if (!conTeclado) d.focus({ preventScroll: true });
    document.documentElement.classList.add("sin-scroll");
    let cancelado = false;
    const img = lienzo.current?.querySelector("img");
    (async () => {
      const { gsap } = await cargarMotor();
      // La imagen grande tiene que estar lista antes de salir de la percha (si no, viajaría vacía)
      // (al cambiar de pieza el fondo ya está puesto, así que se puede esperar algo más)
      // (normalmente ya está precargada al acercar el dedo o el ratón; si no, se espera un poco más antes de salir)
      await Promise.race([img?.decode().catch(() => {}), new Promise((r) => setTimeout(r, cambio ? 1500 : 1000))]);
      if (cancelado) return;
      gsap.set(lienzo.current, { transformOrigin: "0 0" });
      // A partir de aquí GSAP pone cada estado inicial: ya se puede quitar el «oculto mientras carga» del CSS
      queueMicrotask(() => d.removeAttribute("data-preparando"));
      if (cambio) {
        // De una pieza a la otra: el fondo ya estaba, solo entra la prenda nueva
        onOcultarOrigen(true);
        gsap.set(fondo.current, { opacity: 1 });
        gsap.fromTo(lienzo.current, { opacity: 0, y: reducido() ? 0 : 16 }, { opacity: 1, y: 0, duration: DURACION.media, ease: CURVA.entrada });
        gsap.set(info.current, { opacity: 1 });
        return;
      }
      const desde = reducido() ? null : desdeOrigen();
      if (desde) {
        onOcultarOrigen(true);
        gsap.fromTo(lienzo.current, { ...desde, force3D: true }, { x: 0, y: 0, scale: 1, duration: 0.65, ease: CURVA.entrada, force3D: true });
      } else {
        gsap.fromTo(lienzo.current, { opacity: 0 }, { opacity: 1, duration: DURACION.media, ease: CURVA.entrada });
      }
      gsap.fromTo(fondo.current, { opacity: 0 }, { opacity: 1, duration: DURACION.media, ease: CURVA.entrada });
      gsap.fromTo(
        info.current,
        { opacity: 0, y: reducido() ? 0 : 24 },
        { opacity: 1, y: 0, duration: DURACION.media, delay: desde ? 0.25 : 0, ease: CURVA.entrada },
      );
    })();
    return () => {
      cancelado = true;
      document.documentElement.classList.remove("sin-scroll");
    };
    // Solo al montar: la vista se monta una vez por prenda abierta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const terminar = useCallback(() => {
    dialogo.current?.close();
    onOcultarOrigen(false);
    onCerrada();
  }, [onCerrada, onOcultarOrigen]);

  /** Cierre: la prenda vuelve a su percha (o se funde si no hay percha a la vista o con movimiento reducido) */
  const cerrar = useCallback(
    async (deslizando = false) => {
      if (cerrando.current) return;
      cerrando.current = true;
      const { gsap } = await cargarMotor();
      const hacia = !reducido() && !deslizando ? desdeOrigen() : null;
      const tl = gsap.timeline({ onComplete: terminar });
      tl.to(info.current, { opacity: 0, duration: DURACION.rapida, ease: CURVA.salida }, 0);
      tl.to(fondo.current, { opacity: 0, duration: DURACION.media, ease: CURVA.transicion }, 0);
      if (hacia) {
        // Vuelve con la cara de delante, como está colgada
        gsap.set(caras.current, { scaleX: 1 });
        setCara("delante");
        tl.to(contenido.current, { y: 0, duration: DURACION.rapida }, 0);
        tl.to(lienzo.current, { ...hacia, duration: 0.55, ease: CURVA.transicion }, 0);
      } else if (deslizando) {
        tl.to(contenido.current, { y: window.innerHeight * 0.6, opacity: 0, duration: 0.35, ease: CURVA.salida }, 0);
      } else {
        tl.to(contenido.current, { opacity: 0, duration: DURACION.rapida, ease: CURVA.salida }, 0);
      }
    },
    [desdeOrigen, terminar],
  );

  useEffect(() => {
    registrarCierre(() => void cerrar());
    return () => registrarCierre(() => {});
  }, [cerrar, registrarCierre]);

  // Esc: el <dialog> lo cierra de golpe; se intercepta para animar la vuelta
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    const alCancelar = (e: Event) => {
      e.preventDefault();
      void cerrar();
    };
    d.addEventListener("cancel", alCancelar);
    return () => d.removeEventListener("cancel", alCancelar);
  }, [cerrar]);

  /** Delante / Detrás: volteo (la prenda se estrecha, cambia de cara y se abre) o fundido con movimiento reducido */
  async function verCara(nueva: "delante" | "detras") {
    if (nueva === cara || girando) return;
    if (reducido()) {
      setCara(nueva);
      return;
    }
    setGirando(true);
    const { gsap } = await cargarMotor();
    gsap
      .timeline({ onComplete: () => setGirando(false) })
      .to(caras.current, { scaleX: 0, duration: 0.2, ease: "power2.in", force3D: true, onComplete: () => setCara(nueva) })
      .to(caras.current, { scaleX: 1, duration: 0.32, ease: "power3.out", force3D: true });
  }

  // Deslizar hacia abajo para cerrar (sobre todo en el móvil)
  const arrastre = useRef<{ y: number; id: number } | null>(null);
  const deslizado = useRef(false);
  function alPulsar(e: React.PointerEvent) {
    if (e.pointerType === "mouse" || cerrando.current) return;
    arrastre.current = { y: e.clientY, id: e.pointerId };
    deslizado.current = false;
  }
  // El arrastre va a ritmo del dedo: un solo fotograma por movimiento, sin esperas ni promesas por medio
  const motor = useRef<Awaited<ReturnType<typeof cargarMotor>> | null>(null);
  useEffect(() => {
    void cargarMotor().then((m) => {
      motor.current = m;
    });
  }, []);
  function alMover(e: React.PointerEvent) {
    const a = arrastre.current;
    const gsap = motor.current?.gsap;
    if (!a || a.id !== e.pointerId || !gsap) return;
    const dy = Math.max(0, e.clientY - a.y);
    if (dy > 8) deslizado.current = true;
    // Resistencia suave: cuanto más bajas, menos se mueve (como una hoja que tira)
    const y = dy < 160 ? dy : 160 + (dy - 160) * 0.5;
    gsap.set(contenido.current, { y, force3D: true });
    gsap.set(fondo.current, { opacity: Math.max(0.3, 1 - dy / 420) });
  }
  async function alSoltar(e: React.PointerEvent) {
    const a = arrastre.current;
    if (!a || a.id !== e.pointerId) return;
    arrastre.current = null;
    const dy = e.clientY - a.y;
    if (dy > UMBRAL_CIERRE) return void cerrar(true);
    const { gsap } = await cargarMotor();
    gsap.to(contenido.current, { y: 0, duration: 0.35, ease: "back.out(1.4)" });
    gsap.to(fondo.current, { opacity: 1, duration: 0.3, ease: CURVA.entrada });
  }

  const estiloCara = (c: CaraPrenda): React.CSSProperties => ({
    left: `${((ANCHO_IMAGEN / 2 - c.engancheX) / ANCHO_IMAGEN) * 100}%`,
    top: `${((ANCLA_Y[prenda.tipo] - c.engancheY) / ALTO_IMAGEN) * 100}%`,
  });

  return (
    <dialog
      ref={dialogo}
      className="vista"
      tabIndex={-1}
      data-preparando=""
      data-cambio={cambio || undefined}
      aria-labelledby={idTitulo}
      onClick={(e) => {
        // Pinchar fuera de la prenda y de la ficha cierra (pero no al terminar de deslizar)
        if (deslizado.current) {
          deslizado.current = false;
          return;
        }
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.cierra !== undefined) void cerrar();
      }}
    >
      <div ref={fondo} className="vista__fondo" data-cierra />
      <div ref={contenido} className="vista__contenido" data-cierra>
        <button type="button" className="vista__cerrar" onClick={() => void cerrar()} aria-label="Cerrar">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="vista__escena" data-cierra onPointerDown={alPulsar} onPointerMove={alMover} onPointerUp={alSoltar} onPointerCancel={alSoltar}>
          <div
            className="vista__prenda"
            style={{ "--aspecto": `${(x1 - x0) / (y1 - y0)}` } as React.CSSProperties}
          >
            <div
              ref={lienzo}
              className="vista__lienzo"
              style={{
                width: `${(ANCHO_IMAGEN / (x1 - x0)) * 100}%`,
                height: `${(ALTO_IMAGEN / (y1 - y0)) * 100}%`,
                left: `${(-x0 / (x1 - x0)) * 100}%`,
                top: `${(-y0 / (y1 - y0)) * 100}%`,
              }}
            >
              <div ref={caras} className="vista__caras">
                {(["delante", "detras"] as const).map((c) => (
                  <div key={c} className="vista__cara" style={estiloCara(prenda[c])} data-visible={cara === c || undefined}>
                    <Image
                      src={prenda[c].src}
                      alt={cara === c ? prenda[c].alt : ""}
                      aria-hidden={cara !== c || undefined}
                      width={ANCHO_IMAGEN}
                      height={ALTO_IMAGEN}
                      sizes={SIZES_VISTA}
                      loading="eager"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {pareja ? (
          // Precarga de la otra pieza (mismo tamaño que se usará): al pulsar «Va con» aparece sin esperar
          <div className="vista__precarga" aria-hidden="true">
            <Image src={pareja.delante.src} alt="" width={ANCHO_IMAGEN} height={ALTO_IMAGEN} sizes={SIZES_VISTA} loading="eager" />
          </div>
        ) : null}
        <div ref={info} className="vista__info">
          <span className="vista__asa" aria-hidden="true" />
          <p className="vista__antetitulo">Equipación de colaboración</p>
          <h2 id={idTitulo} className="vista__nombre">
            {prenda.nombre ?? <span className="pendiente">[NOMBRE]</span>}
          </h2>
          {pareja ? (
            <p className="vista__pareja">
              Va con{" "}
              <button type="button" onClick={() => onVerPieza(pareja.slug)}>
                {pareja.nombre ?? (pareja.tipo === "short" ? "el short" : "el rashguard")}
              </button>
            </p>
          ) : null}
          {prenda.descripcion ? <p className="vista__descripcion">{prenda.descripcion}</p> : null}
          {prenda.tallas.length ? (
            <p className="vista__tallas">
              <span className="text-gris">Tallas: </span>
              {prenda.tallas.join(" · ")}
            </p>
          ) : null}
          <div className="vista__caras-selector" role="group" aria-label="Ver la prenda">
            {(["delante", "detras"] as const).map((c) => (
              <button key={c} type="button" aria-pressed={cara === c} onClick={() => void verCara(c)}>
                {c === "delante" ? "Delante" : "Detrás"}
              </button>
            ))}
          </div>
          <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className="boton-pedir vista__cta">
            Escríbenos por Instagram
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          <p className="vista__nota">¿Una así para tu academia o tu equipo? Hablemos.</p>
        </div>
      </div>
    </dialog>
  );
}
