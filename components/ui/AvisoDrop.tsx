"use client";

import { useEffect, useState } from "react";
import { dosCifras, useCuentaAtras } from "@/hooks/useCuentaAtras";
import { INSTAGRAM_DM_URL } from "@/lib/marca";

type Props = {
  fechaIso: string;
  /** Texto que pinta el servidor antes de que el cliente calcule («Sale el 30 de octubre») */
  textoInicial: string;
  variante: "cabecera" | "barra";
};

/**
 * Recordatorio de la próxima prenda, siempre a mano: en la cabecera en escritorio y como barra fija abajo en móvil.
 * La barra se esconde mientras la sección «Lo próximo» está en pantalla (no repetir lo que ya se ve).
 */
export function AvisoDrop({ fechaIso, textoInicial, variante }: Props) {
  const cuenta = useCuentaAtras(fechaIso);
  // Empieza oculta: la portada está en pantalla al cargar
  const [oculta, setOculta] = useState(variante === "barra");

  useEffect(() => {
    if (variante !== "barra") return;
    // Oculta en la portada (no tapar el primer vistazo) y mientras «Lo próximo» está en pantalla
    const seccion = document.getElementById("lo-proximo")?.closest("section");
    const portada = document.getElementById("manifiesto-titulo")?.closest("section");
    const visibles = new Set<Element>();
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visibles.add(e.target);
          else visibles.delete(e.target);
        }
        setOculta(visibles.size > 0);
      },
      { threshold: [0, 0.15], rootMargin: "0px 0px -35% 0px" },
    );
    if (seccion) io.observe(seccion);
    if (portada) io.observe(portada);
    return () => io.disconnect();
  }, [variante]);

  const fuera = cuenta?.fase === "fuera";
  const urgente = cuenta?.fase === "horas" || cuenta?.fase === "ultima";
  const p = cuenta?.partes;
  const tiempo = p ? (p.dias > 0 ? `${p.dias} d ${dosCifras(p.horas)} h ${dosCifras(p.minutos)} min` : `${dosCifras(p.horas)}:${dosCifras(p.minutos)}:${dosCifras(p.segundos)}`) : null;
  const etiqueta = fuera ? "Ya ha salido" : cuenta?.fase === "ultima" ? "Última hora" : urgente ? "Últimas horas" : "La próxima sale en";

  const contenido = (
    <>
      <span aria-hidden="true" className="punto-vivo" />
      <span className="aviso-drop__texto">{cuenta ? etiqueta : textoInicial}</span>
      {fuera ? (
        <span className="aviso-drop__tiempo">Escríbenos</span>
      ) : tiempo ? (
        <span className="aviso-drop__tiempo" suppressHydrationWarning>
          {tiempo}
        </span>
      ) : null}
    </>
  );

  return fuera ? (
    <a
      href={INSTAGRAM_DM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`aviso-drop aviso-drop--${variante}`}
      data-fase="fuera"
      data-oculta={oculta || undefined}
      aria-label="Ya ha salido la prenda nueva: escríbenos por Instagram (se abre en una pestaña nueva)"
    >
      {contenido}
    </a>
  ) : (
    <a
      href="#lo-proximo"
      className={`aviso-drop aviso-drop--${variante}`}
      data-fase={cuenta?.fase ?? "lejos"}
      data-oculta={oculta || undefined}
      aria-label={`${textoInicial}. Ir a lo próximo`}
      tabIndex={variante === "barra" && oculta ? -1 : undefined}
    >
      {contenido}
    </a>
  );
}
