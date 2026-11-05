import type { Metadata } from "next";

// Open Graph común. Si una página define su propio openGraph, Next sustituye el del layout entero
// (no lo mezcla): por eso cada página parte de esta base y solo añade su URL y, si la tiene, su foto.
export const OG_BASE = {
  type: "website",
  locale: "es_ES",
  siteName: "CGA Training Hard",
} as const satisfies NonNullable<Metadata["openGraph"]>;

/** JSON-LD listo para <script type="application/ld+json">: «<» escapado para que nunca cierre la etiqueta */
export function jsonLd(datos: object) {
  return { __html: JSON.stringify(datos).replace(/</g, "\\u003c") };
}
