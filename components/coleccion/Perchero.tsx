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
export function Perchero({
  prendas,
  sincronizarUrl = true,
  prioridad = false,
}: {
  prendas: PrendaColeccion[];
  /** true solo si el perchero abre la página: si no, sus fotos no deben competir con lo de arriba (LCP) */
  prioridad?: boolean;
  /** false en la portada: allí manda la puerta del laberinto y los enlaces para compartir van a /colaboraciones */
  sincronizarUrl?: boolean;
}) {
  const fila = useRef<HTMLUListElement>(null);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const [activa, setActiva] = useState(0);
  const [abierta, setAbierta] = useState<{ indice: number; desdeEnlace: boolean; cambio?: boolean; conTeclado?: boolean } | null>(null);
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

  // ---------- Las prendas que no se ven no se balancean (menos trabajo para el móvil) ----------
  useEffect(() => {
    const f = fila.current;
    if (!f || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) (e.target as HTMLElement).toggleAttribute("data-quieta", !e.isIntersecting);
      },
      { rootMargin: "120px" },
    );
    f.querySelectorAll(".colgada").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [prendas]);

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
    delete e.currentTarget.dataset.sinAnillo; // vuelve el teclado: el foco se ve otra vez
    const mapa: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: prendas.length - 1 };
    if (e.key in mapa) {
      e.preventDefault();
      enfocar(mapa[e.key]);
    }
  }

  // ---------- Abrir / cerrar y la URL ----------
  const conTecladoRef = useRef(false);
  const abrir = useCallback(
    (indice: number, desdeEnlace = false, conTeclado = false) => {
      conTecladoRef.current = conTeclado;
      marcarSinAnillo(botones.current[indice], !conTeclado);
      setActiva(indice);
      setAbierta({ indice, desdeEnlace, conTeclado });
      if (!sincronizarUrl) return;
      const url = new URL(location.href);
      url.searchParams.set("prenda", prendas[indice].slug);
      if (desdeEnlace) history.replaceState({ prenda: true }, "", url);
      else history.pushState({ prenda: true }, "", url);
    },
    [prendas, sincronizarUrl],
  );

  /** De una pieza a la otra de su equipación sin cerrar la vista: la URL cambia y el perchero se coloca detrás */
  const verPieza = useCallback(
    (slug: string) => {
      const indice = prendas.findIndex((p) => p.slug === slug);
      if (indice < 0) return;
      marcarSinAnillo(botones.current[indice], !conTecladoRef.current);
      setActiva(indice);
      setOculta(null);
      setAbierta((a) => ({ indice, desdeEnlace: a?.desdeEnlace ?? false, cambio: true, conTeclado: a?.conTeclado }));
      botones.current[indice]?.scrollIntoView({ inline: "center", block: "nearest" });
      if (!sincronizarUrl) return;
      const url = new URL(location.href);
      url.searchParams.set("prenda", slug);
      history.replaceState(history.state, "", url);
    },
    [prendas, sincronizarUrl],
  );

  const alCerrar = useCallback(() => {
    const indice = abierta?.indice;
    setAbierta(null);
    const url = new URL(location.href);
    if (sincronizarUrl && url.searchParams.has("prenda")) {
      // Abierta desde la barra: se deshace la entrada del historial. Desde un enlace: se limpia la URL.
      if (history.state?.prenda && !abierta?.desdeEnlace) history.back();
      else {
        url.searchParams.delete("prenda");
        history.replaceState(null, "", url);
      }
    }
    // El foco vuelve a la percha; el recuadro solo se ve si se abrió con el teclado (con el dedo queda fatal)
    const boton = indice !== undefined ? botones.current[indice] : null;
    if (boton) {
      boton.focus({ preventScroll: true, focusVisible: !!abierta?.conTeclado } as FocusOptions);
      // Safari (iPhone) no hace caso a focusVisible y pinta el recuadro: lo quita data-sin-anillo hasta que el foco se va
      if (boton.dataset.sinAnillo !== undefined) boton.addEventListener("blur", () => delete boton.dataset.sinAnillo, { once: true });
    }
  }, [abierta, sincronizarUrl]);

  // Enlace compartido: ?prenda=slug abre esa prenda al cargar
  useEffect(() => {
    if (!sincronizarUrl) return;
    const slug = new URLSearchParams(location.search).get("prenda");
    const i = prendas.findIndex((p) => p.slug === slug);
    if (i >= 0) {
      botones.current[i]?.scrollIntoView({ inline: "center", block: "nearest" });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- la URL solo existe en el cliente
      abrir(i, true);
    }
  }, [prendas, abrir, sincronizarUrl]);

  // Atrás del navegador con la prenda abierta: se cierra
  const cerrarDesdeHistorial = useRef<() => void>(() => {});
  useEffect(() => {
    if (!sincronizarUrl) return;
    const alVolver = () => {
      if (!new URLSearchParams(location.search).has("prenda")) cerrarDesdeHistorial.current();
    };
    addEventListener("popstate", alVolver);
    return () => removeEventListener("popstate", alVolver);
  }, [sincronizarUrl]);

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
            prioridad={prioridad && i < PRIMERAS}
            inicioEquipo={i === 0 || !p.equipacion || prendas[i - 1].equipacion !== p.equipacion}
            onAbrir={(conTeclado) => abrir(i, false, conTeclado)}
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
          conTeclado={abierta.conTeclado ?? false}
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

/** Abierta con el dedo o el ratón: al volver, el botón recibe el foco (accesibilidad) pero sin recuadro.
 *  Se marca antes de abrir porque el propio <dialog> devuelve el foco al cerrarse, antes que nosotros. */
function marcarSinAnillo(boton: HTMLButtonElement | null | undefined, sinAnillo: boolean) {
  if (!boton) return;
  if (sinAnillo) boton.dataset.sinAnillo = "";
  else delete boton.dataset.sinAnillo;
}

function reducido() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}
