"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CLAVE_PUERTA, EVENTO_PUERTA_ABIERTA } from "@/lib/puerta";

// Las pruebas (y GSAP) solo se descargan si la puerta está cerrada: nunca entran en el JS inicial.
const cargarJuego = () => import("./PuertaJuego").then((m) => m.PuertaJuego);
const PuertaJuego = dynamic(cargarJuego, {
  ssr: false,
  loading: () => <p className="puerta__cargando text-gris">Preparando el tatami…</p>,
});

const FONDO = "body > header, body > main, body > footer";

function fijarFase(fase: "intro" | "juego" | "revelando") {
  document.getElementById("puerta")?.setAttribute("data-fase", fase);
}

/** Marca en la barra las letras superadas (C, G, A) y la prueba en curso. */
function pintarLetras(superadas: number) {
  document.querySelectorAll<HTMLElement>("#puerta [data-letra]").forEach((li) => {
    const i = Number(li.dataset.letra);
    li.dataset.estado = i < superadas ? "superada" : i === superadas ? "actual" : "pendiente";
    const texto = li.querySelector("[data-letra-estado]");
    if (texto) texto.textContent = i < superadas ? "superada" : "pendiente";
  });
}

/** Botón «Empezar» y control de la puerta: foco, inert del fondo, secuencia de pruebas y apertura. */
export function PuertaControl() {
  const [destino, setDestino] = useState<HTMLElement | null>(null);
  const superadas = useRef(0);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    // Sin html.con-puerta el CSS la mantiene oculta (display: none) y no se hace nada más
    if (!html.classList.contains("con-puerta")) return;
    html.dataset.puerta = "montada";
    const fondo = document.querySelectorAll<HTMLElement>(FONDO);
    fondo.forEach((el) => (el.inert = true));
    boton.current?.focus({ preventScroll: true });
    // Precarga de las pruebas en cuanto el navegador esté libre: al pulsar «Empezar» ya están
    const ric = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 200));
    ric(() => void cargarJuego());
    return () => fondo.forEach((el) => (el.inert = false));
  }, []);

  function empezar() {
    fijarFase("juego");
    pintarLetras(0);
    setDestino(document.getElementById("puerta-juego"));
  }

  function abrir() {
    const html = document.documentElement;
    try {
      localStorage.setItem(CLAVE_PUERTA, "1");
    } catch {
      // Sin almacenamiento la puerta volvería a salir en la próxima visita; no es grave
    }
    document.querySelectorAll<HTMLElement>(FONDO).forEach((el) => (el.inert = false));
    window.scrollTo(0, 0);
    html.classList.remove("con-puerta");
    delete html.dataset.puerta;
    setDestino(null);
    window.dispatchEvent(new Event(EVENTO_PUERTA_ABIERTA));
    // Red de seguridad: si la animación de la portada no llega, que no se quede nada oculto
    window.setTimeout(() => html.classList.remove("anim"), 2500);
    document.getElementById("manifiesto-titulo")?.focus({ preventScroll: true });
  }

  return (
    <>
      <button ref={boton} type="button" className="boton-puerta mt-10" onClick={empezar}>
        Empezar
      </button>
      {destino
        ? createPortal(
            <PuertaJuego
              alSuperar={() => pintarLetras(++superadas.current)}
              alRevelar={() => fijarFase("revelando")}
              alTerminar={abrir}
            />,
            destino,
          )
        : null}
    </>
  );
}
