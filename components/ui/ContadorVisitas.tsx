"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Apunta una visita por página vista (también al navegar dentro de la web). Sin cookies ni almacenamiento:
 * un aviso de 100 bytes con la ruta y de dónde viene, que se envía sin esperar respuesta (sendBeacon).
 * No cuenta el panel, las rutas de pruebas ni los navegadores automatizados.
 */
export function ContadorVisitas() {
  const ruta = usePathname();
  useEffect(() => {
    if (!ruta || ruta.startsWith("/admin") || ruta.startsWith("/dev") || navigator.webdriver) return;
    const datos = JSON.stringify({ ruta, referente: document.referrer || null });
    try {
      navigator.sendBeacon("/api/visita", new Blob([datos], { type: "application/json" }));
    } catch {
      // sin sendBeacon: no pasa nada, es solo estadística
    }
  }, [ruta]);
  return null;
}
