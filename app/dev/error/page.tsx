import { notFound } from "next/navigation";
import { Romper } from "./Romper";

// Banco de pruebas de error.tsx. En producción solo existe si CGA_RUTAS_DEV=1.
export const metadata = { robots: { index: false, follow: false } };

export default function Pagina() {
  if (process.env.NODE_ENV === "production" && process.env.CGA_RUTAS_DEV !== "1") notFound();
  return <Romper />;
}
