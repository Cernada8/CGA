import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PruebaRevelado } from "./PruebaRevelado";

// Banco de pruebas del revelado C-G-A y de la cuenta atrás mientras no existe el laberinto.
// En producción solo existe si CGA_RUTAS_DEV=1.
export const metadata: Metadata = { title: "Pruebas de animación", robots: { index: false, follow: false } };

export default function Pagina() {
  if (process.env.NODE_ENV === "production" && process.env.CGA_RUTAS_DEV !== "1") notFound();
  return <PruebaRevelado />;
}
