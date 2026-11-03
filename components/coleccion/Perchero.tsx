"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { parejaDe, type PrendaColeccion } from "@/lib/coleccion";
import { cargarMotor } from "@/lib/gsap-cliente";
import { DefinicionesMetal } from "./Percha";
import { altoCaja, PrendaColgada } from "./PrendaColgada";
import "./perchero.css";

// La vista ampliada (y GSAP) solo se descargan cuando alguien abre una prenda
const VistaAmpliada = dynamic(() => import("./VistaAmpliada").then((m) => m.VistaAmpliada), { ssr: false });

/** En cuanto alguien se acerca a la barra se descargan la vista y GSAP: al pinchar, la animación sale sin espera */
let precargado = false;
function precargar() {
  if (precargado) return;
  precargado = true;
  void import("./VistaAmpliada");
  void cargarMotor();
}

/** Prendas que se ven de entrada y se cargan sin esperar (el resto, en diferido) */
const PRIMERAS = 3;

/**
 * Perchero: barra fija y prendas colgadas en una fila con scroll-snap.
 * Móvil: deslizar. Escritorio: arrastrar con el ratón, flechas en pantalla o teclado (←/→, Inicio/Fin).
 * La prenda abierta va en la URL (?prenda=slug) para poder compartirla.
 */
export function Perchero({ prendas }: { prendas: PrendaColeccion[] }) {
  const fila = useRef<HTMLUListElement>(null);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const [activa, setActiva] = useState(0);
  const [abierta, setAbierta] = useState<{ indice: number; desdeEnlace: boolean; cambio?: boolean } | null>(null);
  const [oculta, setOculta] = useState<number | null>(null);
  const [bordes, setBordes] = useState({ inicio: true, fin: true });

  // ---------- Flechas: solo si la fila no cabe ----------
  const medir = useCallback(() => {
    const f = fila.current;
    if (!f) return;
    setBordes({ inicio: f.scrollLeft <= 2, fin: f.scrollLeft + f.clientWidth >= f.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    medir();
    const f = fila.current;
    const ro = new ResizeObserver(medir);
    if (f) ro.observe(f);
    return () => ro.disconnect();
  }, [medir]);

  function desplazar(sentido: 1 | -1) {
    const f = fila.current;
    const paso = botones.current[0]?.parentElement?.getBoundingClientRect().width ?? 300;
    f?.scrollBy({ left: sentido * paso * 0.7, behavior: reducido() ? "auto" : "smooth" });
  }

  // ---------- Arrastrar con el ratón (en táctil ya desliza el navegador) ----------
  const arrastre = useRef<{ x: number; scroll: number; movido: boolean } | null>(null);
  const bloquearClic = useRef(false);
  function alPulsar(e: React.PointerEvent<HTMLUListElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    arrastre.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft, movido: false };
  }
  function alMover(e: React.PointerEvent<HTMLUListElement>) {
    const a = arrastre.current;
    if (!a) return;
    const dx = e.clientX - a.x;
    if (!a.movido && Math.abs(dx) > 6) {
      a.movido = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.arrastrando = "";
    }
    if (a.movido) e.currentTarget.scrollLeft = a.scroll - dx;
  }
  function alSoltar(e: React.PointerEvent<HTMLUListElement>) {
    const a = arrastre.current;
    arrastre.current = null;
    delete e.currentTarget.dataset.arrastrando;
    if (a?.movido) bloquearClic.current = true; // el clic que llega al soltar no abre la prenda
  }

  // ---------- Teclado: un solo tabulador para toda la fila, flechas para moverse ----------
  function enfocar(i: number) {
    const destino = Math.max(0, Math.min(prendas.length - 1, i));
    setActiva(destino);
    const b = botones.current[destino];
    b?.focus({ preventScroll: true });
    b?.scrollIntoView({ inline: "center", block: "nearest", behavior: reducido() ? "auto" : "smooth" });
  }
  function alTeclear(i: number, e: React.KeyboardEvent<HTMLButtonElement>) {
    const mapa: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: prendas.length - 1 };
    if (e.key in mapa) {
      e.preventDefault();
      enfocar(mapa[e.key]);
    }
  }

  // ---------- Abrir / cerrar y la URL ----------
  const abrir = useCallback(
    (indice: number, desdeEnlace = false) => {
      setActiva(indice);
      setAbierta({ indice, desdeEnlace });
      const url = new URL(location.href);
      url.searchParams.set("prenda", prendas[indice].slug);
      if (desdeEnlace) history.replaceState({ prenda: true }, "", url);
      else history.pushState({ prenda: true }, "", url);
    },
    [prendas],
  );

  /** De una pieza a la otra de su equipación sin cerrar la vista: la URL cambia y el perchero se coloca detrás */
  const verPieza = useCallback(
    (slug: string) => {
      const indice = prendas.findIndex((p) => p.slug === slug);
      if (indice < 0) return;
      setActiva(indice);
      setOculta(null);
      setAbierta((a) => ({ indice, desdeEnlace: a?.desdeEnlace ?? false, cambio: true }));
      botones.current[indice]?.scrollIntoView({ inline: "center", block: "nearest" });
      const url = new URL(location.href);
      url.searchParams.set("prenda", slug);
      history.replaceState(history.state, "", url);
    },
    [prendas],
  );

  const alCerrar = useCallback(() => {
    const indice = abierta?.indice;
    setAbierta(null);
    const url = new URL(location.href);
    if (url.searchParams.has("prenda")) {
      // Abierta desde la barra: se deshace la entrada del historial. Desde un enlace: se limpia la URL.
      if (history.state?.prenda && !abierta?.desdeEnlace) history.back();
      else {
        url.searchParams.delete("prenda");
        history.replaceState(null, "", url);
      }
    }
    if (indice !== undefined) botones.current[indice]?.focus({ preventScroll: true });
  }, [abierta]);

  // Enlace compartido: ?prenda=slug abre esa prenda al cargar
  useEffect(() => {
    const slug = new URLSearchParams(location.search).get("prenda");
    const i = prendas.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      botones.current[i]?.scrollIntoView({ inline: "center", block: "nearest" });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- la URL solo existe en el cliente
      abrir(i, true);
    }
  }, [prendas, abrir]);

  // Atrás del navegador con la prenda abierta: se cierra
  const cerrarDesdeHistorial = useRef<() => void>(() => {});
  useEffect(() => {
    const alVolver = () => {
      if (!new URLSearchParams(location.search).has("prenda")) cerrarDesdeHistorial.current();
    };
    addEventListener("popstate", alVolver);
    return () => removeEventListener("popstate", alVolver);
  }, []);

  return (
    <div className="perchero" style={{ "--alto-caja": altoCaja(prendas) } as React.CSSProperties}>
      <DefinicionesMetal />
      <div className="perchero__barra" aria-hidden="true">
        <span className="perchero__soporte perchero__soporte--izq" />
        <span className="perchero__tubo" />
        <span className="perchero__soporte perchero__soporte--der" />
      </div>
      <ul
        ref={fila}
        className="perchero__fila"
        aria-label="Equipaciones colgadas en el perchero"
        onScroll={medir}
        onPointerEnter={precargar}
        onTouchStart={precargar}
        onFocus={precargar}
        onPointerDown={alPulsar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onClickCapture={(e) => {
          if (bloquearClic.current) {
            e.stopPropagation();
            e.preventDefault();
            bloquearClic.current = false;
          }
        }}
      >
        {prendas.map((p, i) => (
          <PrendaColgada
            key={p.slug}
            ref={(el) => {
              botones.current[i] = el;
            }}
            prenda={p}
            indice={i}
            activa={i === activa}
            oculta={oculta === i}
            prioridad={i < PRIMERAS}
            inicioEquipo={i === 0 || !p.equipacion || prendas[i - 1].equipacion !== p.equipacion}
            onAbrir={() => abrir(i)}
            onKeyDown={(e) => alTeclear(i, e)}
          />
        ))}
      </ul>
      {bordes.inicio && bordes.fin ? null : (
        <div className="perchero__flechas">
          <button type="button" onClick={() => desplazar(-1)} disabled={bordes.inicio} aria-label="Prendas anteriores">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" onClick={() => desplazar(1)} disabled={bordes.fin} aria-label="Más prendas">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      {abierta ? (
        <VistaAmpliada
          key={prendas[abierta.indice].slug}
          prenda={prendas[abierta.indice]}
          origen={abierta.desdeEnlace && !abierta.cambio ? null : () => botones.current[abierta.indice]?.querySelector<HTMLElement>("[data-imagen-origen]") ?? null}
          cambio={abierta.cambio ?? false}
          pareja={parejaDe(prendas[abierta.indice], prendas)}
          onVerPieza={verPieza}
          onOcultarOrigen={(o) => setOculta(o ? abierta.indice : null)}
          onCerrada={alCerrar}
          registrarCierre={(fn) => {
            cerrarDesdeHistorial.current = fn;
          }}
        />
      ) : null}
    </div>
  );
}

function reducido() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
