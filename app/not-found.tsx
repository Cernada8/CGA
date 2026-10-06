import type { Metadata } from "next";
import { PaginaError } from "@/components/ui/PaginaError";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NoEncontrado() {
  return <PaginaError codigo="404" titulo="Aquí no hay nada" texto="Esta página no existe o ya no está. Levántate y vuelve al inicio." />;
}
