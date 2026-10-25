"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Celda,
  correr,
  type Direccion,
  esSalida,
  generar,
  type Laberinto,
  resolver,
  salidasDe,
  semillaJugable,
} from "@/lib/laberinto";
import { CURVA, DURACION } from "@/lib/motion";
import type { PropsPrueba } from "./PuertaJuego";

/** Segundos por casilla al correr por un pasillo */
const S_POR_CASILLA = 0.06;
/** A los 25 s aparece el botón de ayuda; a los 45 s el camino se marca solo */
const MS_BOTON_AYUDA = 25_000;
const MS_AYUDA_SOLA = 45_000;

const TECLAS: Record<string, Direccion> = {
  ArrowUp: "arriba",
  ArrowDown: "abajo",
  ArrowLeft: "izquierda",
  ArrowRight: "derecha",
  w: "arriba",
  s: "abajo",
  a: "izquierda",
  d: "derecha",
  W: "arriba",
  S: "abajo",
  A: "izquierda",
  D: "derecha",
};

const NOMBRE: Record<Direccion, string> = { arriba: "arriba", abajo: "abajo", izquierda: "izquierda", derecha: "derecha" };

function leerVariable(nombre: string, porDefecto: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim() || porDefecto;
}

function listaHumana(d: Direccion[]) {
  const n = d.map((x) => NOMBRE[x]);
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} o ${n[n.length - 1]}` : n[0];
}

/** C · Constancia: salir del tatami. Te equivocas de camino, vuelves y sigues. */
export function PruebaLaberinto({ motor, reducido, alSuperar }: PropsPrueba) {
  const [lab] = useState<Laberinto>(() => {
    const movil = matchMedia("(max-width: 767px)").matches;
    const [c, f] = movil ? [7, 9] : [11, 8];
    return generar(c, f, semillaJugable(c, f, Math.floor(Math.random() * 2 ** 31)));
  });
  const [ayuda, setAyuda] = useState<"no" | "boton" | "activa">("no");
  const [aviso, setAviso] = useState("");

  const marco = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const jugador = useRef<HTMLDivElement>(null);
  const salida = useRef<HTMLDivElement>(null);
  const tablero = useRef<HTMLDivElement>(null);

  // Estado mutable del juego (no provoca renders)
  const juego = useRef({
    pos: lab.inicio as Celda,
    rastro: [{ x: lab.inicio.x + 0.5, y: lab.inicio.y + 0.5 }] as { x: number; y: number }[],
    punta: { x: lab.inicio.x + 0.5, y: lab.inicio.y + 0.5 },
    moviendo: false,
    cola: null as Direccion | null,
    celda: 40,
    margen: 4,
    terminado: false,
    ayuda: false,
  });

  const dibujar = useCallback(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const { celda, margen, rastro, punta } = juego.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    const px = (v: number) => margen + v * celda;
    const blanco = leerVariable("--cga-blanco", "#f4f4f1");

    // Rastro: por dónde has pasado, también los caminos equivocados
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgb(140 140 140 / 0.35)";
    ctx.lineWidth = Math.max(3, celda * 0.14);
    ctx.beginPath();
    rastro.forEach((p, i) => (i ? ctx.lineTo(px(p.x), px(p.y)) : ctx.moveTo(px(p.x), px(p.y))));
    ctx.lineTo(px(punta.x), px(punta.y));
    ctx.stroke();

    // Ayuda: el camino que queda, en discontinuo
    if (juego.current.ayuda) {
      const camino = resolver(lab, juego.current.pos);
      ctx.save();
      ctx.setLineDash([celda * 0.12, celda * 0.22]);
      ctx.strokeStyle = "rgb(244 244 241 / 0.5)";
      ctx.lineWidth = Math.max(2, celda * 0.06);
      ctx.beginPath();
      camino.forEach((c, i) => (i ? ctx.lineTo(px(c.x + 0.5), px(c.y + 0.5)) : ctx.moveTo(px(c.x + 0.5), px(c.y + 0.5))));
      ctx.lineTo(px(lab.columnas + 0.4), px(lab.salida.y + 0.5));
      ctx.stroke();
      ctx.restore();
    }

    // Paredes: líneas de cinta en blanco roto
    ctx.strokeStyle = blanco;
    ctx.lineWidth = Math.max(2, Math.round(celda * 0.07));
    ctx.beginPath();
    for (let y = 0; y < lab.filas; y++) {
      for (let x = 0; x < lab.columnas; x++) {
        const abiertos = lab.pasos[y * lab.columnas + x];
        if (!(abiertos & 1)) {
          ctx.moveTo(px(x), px(y));
          ctx.lineTo(px(x + 1), px(y));
        }
        if (!(abiertos & 8)) {
          ctx.moveTo(px(x), px(y));
          ctx.lineTo(px(x), px(y + 1));
        }
        if (x === lab.columnas - 1 && !(y === lab.salida.y)) {
          ctx.moveTo(px(x + 1), px(y));
          ctx.lineTo(px(x + 1), px(y + 1));
        }
        if (y === lab.filas - 1) {
          ctx.moveTo(px(x), px(y + 1));
          ctx.lineTo(px(x + 1), px(y + 1));
        }
      }
    }
    ctx.stroke();
  }, [lab]);

  const colocar = useCallback((x: number, y: number) => {
    const { celda, margen } = juego.current;
    const j = jugador.current;
    if (j) j.style.transform = `translate(${margen + x * celda}px, ${margen + y * celda}px) translate(-50%, -50%)`;
  }, []);

  // Tamaño: la casilla más grande que quepa en el hueco disponible
  useEffect(() => {
    const m = marco.current;
    const cv = lienzo.current;
    if (!m || !cv) return;
    const medir = () => {
      const { width, height } = m.getBoundingClientRect();
      const celda = Math.max(24, Math.min(64, Math.floor(Math.min((width - 8) / (lab.columnas + 0.6), (height - 8) / lab.filas))));
      const margen = Math.ceil(celda * 0.08);
      juego.current.celda = celda;
      juego.current.margen = margen;
      const w = lab.columnas * celda + margen * 2;
      const h = lab.filas * celda + margen * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      if (tablero.current) {
        tablero.current.style.width = `${w}px`;
        tablero.current.style.height = `${h}px`;
        tablero.current.style.setProperty("--celda", `${celda}px`);
      }
      if (salida.current) {
        salida.current.style.transform = `translate(${margen + lab.columnas * celda}px, ${margen + (lab.salida.y + 0.5) * celda}px) translate(-50%, -50%)`;
      }
      const p = juego.current.punta;
      colocar(p.x, p.y);
      dibujar();
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(m);
    return () => ro.disconnect();
  }, [lab, dibujar, colocar]);

  function activarAyuda() {
    setAyuda("activa");
    setAviso("Camino marcado en discontinuo.");
  }

  // Ayuda sutil si tarda: nunca un muro
  useEffect(() => {
    const t1 = window.setTimeout(() => setAyuda((a) => (a === "no" ? "boton" : a)), MS_BOTON_AYUDA);
    const t2 = window.setTimeout(() => activarAyuda(), MS_AYUDA_SOLA);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
  useEffect(() => {
    juego.current.ayuda = ayuda === "activa";
    if (ayuda === "activa") dibujar();
  }, [ayuda, dibujar]);

  const anunciar = useCallback(
    (c: Celda) => {
      setAviso(`Puedes ir ${listaHumana(salidasDe(lab, c))}.`);
    },
    [lab],
  );

  const salir = useCallback(() => {
    const g = juego.current;
    g.terminado = true;
    setAviso("Fuera del tatami. Constancia superada.");
    if (reducido) {
      alSuperar();
      return;
    }
    const tl = motor.gsap.timeline({ onComplete: alSuperar });
    tl.to(g.punta, {
      x: lab.columnas + 0.6,
      duration: DURACION.rapida,
      ease: CURVA.salida,
      onUpdate: () => {
        colocar(g.punta.x, g.punta.y);
        dibujar();
      },
    });
    tl.to(salida.current, { scale: 2.4, opacity: 0, duration: DURACION.media, ease: CURVA.entrada }, "<0.1");
  }, [lab, motor, reducido, alSuperar, colocar, dibujar]);

  const moverRef = useRef<(d: Direccion) => void>(() => {});
  const mover = useCallback(
    (d: Direccion) => {
      const g = juego.current;
      if (g.terminado) return;
      if (g.moviendo) {
        g.cola = d; // un solo movimiento en cola: responde aunque pulses antes de llegar
        return;
      }
      const recorrido = correr(lab, g.pos, d);
      const j = jugador.current;
      if (!recorrido.length) {
        setAviso(`Pared. Puedes ir ${listaHumana(salidasDe(lab, g.pos))}.`);
        if (!reducido && j) {
          const empuje = { arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0] }[d];
          motor.gsap.fromTo(
            j,
            { "--empuje-x": "0px", "--empuje-y": "0px" },
            { "--empuje-x": `${empuje[0] * 5}px`, "--empuje-y": `${empuje[1] * 5}px`, duration: 0.08, yoyo: true, repeat: 1, ease: CURVA.transicion },
          );
        }
        return;
      }
      const final = recorrido[recorrido.length - 1];
      g.pos = final;
      marco.current?.setAttribute("data-x", String(final.x));
      marco.current?.setAttribute("data-y", String(final.y));
      const fin = () => {
        g.moviendo = false;
        marco.current?.setAttribute("data-movimiento", "quieto");
        if (esSalida(lab, final)) {
          salir();
          return;
        }
        anunciar(final);
        const siguiente = g.cola;
        g.cola = null;
        if (siguiente) moverRef.current(siguiente);
      };
      const puntos = recorrido.map((c) => ({ x: c.x + 0.5, y: c.y + 0.5 }));
      if (reducido) {
        g.rastro.push(...puntos);
        g.punta = { ...puntos[puntos.length - 1] };
        colocar(g.punta.x, g.punta.y);
        dibujar();
        fin();
        return;
      }
      g.moviendo = true;
      marco.current?.setAttribute("data-movimiento", "moviendo");
      const tl = motor.gsap.timeline({ onComplete: fin });
      puntos.forEach((p, i) => {
        const ultimo = i === puntos.length - 1;
        tl.to(g.punta, {
          x: p.x,
          y: p.y,
          duration: ultimo ? S_POR_CASILLA * 2 : S_POR_CASILLA,
          ease: ultimo ? CURVA.entrada : "none",
          onUpdate: () => {
            colocar(g.punta.x, g.punta.y);
            dibujar();
          },
          onComplete: () => {
            g.rastro.push({ ...p });
          },
        });
      });
    },
    [lab, motor, reducido, anunciar, colocar, dibujar, salir],
  );
  useEffect(() => {
    moverRef.current = mover;
  }, [mover]);

  // Teclado: flechas y WASD
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const d = TECLAS[e.key];
      if (!d) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select")) return;
      e.preventDefault();
      mover(d);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [mover]);

  // Táctil: deslizar sobre el tablero
  useEffect(() => {
    const t = tablero.current;
    if (!t) return;
    let inicio: { x: number; y: number; id: number } | null = null;
    const abajo = (e: PointerEvent) => {
      inicio = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const arriba = (e: PointerEvent) => {
      if (!inicio || inicio.id !== e.pointerId) return;
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      inicio = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      mover(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "derecha" : "izquierda") : dy > 0 ? "abajo" : "arriba");
    };
    t.addEventListener("pointerdown", abajo);
    t.addEventListener("pointerup", arriba);
    t.addEventListener("pointercancel", () => (inicio = null));
    return () => {
      t.removeEventListener("pointerdown", abajo);
      t.removeEventListener("pointerup", arriba);
    };
  }, [mover]);

  return (
    <div className="prueba prueba--laberinto">
      <div className="prueba__cabeza">
        <h3 tabIndex={-1} data-foco-inicial className="prueba__titulo font-grito">
          Constancia
        </h3>
        <p className="prueba__texto">
          Sal del tatami. Si te equivocas de camino, vuelves y sigues.
          <span className="prueba__controles"> Flechas o WASD.</span>
          <span className="prueba__controles--tactil"> Desliza o usa la cruceta.</span>
        </p>
      </div>

      <div
        ref={marco}
        className="laberinto"
        role="application"
        aria-roledescription="laberinto"
        aria-label="Laberinto. Muévete con las flechas hasta la salida, en el borde derecho, abajo."
        data-semilla={lab.semilla}
        data-columnas={lab.columnas}
        data-filas={lab.filas}
        data-x={lab.inicio.x}
        data-y={lab.inicio.y}
        data-movimiento="quieto"
      >
        <div ref={tablero} className="laberinto__tablero">
          <canvas ref={lienzo} aria-hidden="true" className="laberinto__lienzo" />
          <div ref={salida} aria-hidden="true" className="laberinto__salida" />
          <div ref={jugador} aria-hidden="true" className="laberinto__jugador" />
        </div>
      </div>

      <div className="laberinto__pie">
        <div className="cruceta" role="group" aria-label="Cruceta">
          {(["arriba", "izquierda", "derecha", "abajo"] as const).map((d) => (
            <button key={d} type="button" className="cruceta__boton" data-dir={d} aria-label={`Mover ${d}`} onClick={() => mover(d)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 6l7 9H5z" fill="currentColor" />
              </svg>
            </button>
          ))}
        </div>
        {ayuda === "boton" ? (
          <button type="button" className="prueba__ayuda" onClick={activarAyuda}>
            Marcar el camino
          </button>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {aviso}
      </p>
    </div>
  );
}
