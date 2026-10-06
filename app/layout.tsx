import type { Metadata, Viewport } from "next";
import { Archivo, Pirata_One, Sedgwick_Ave_Display } from "next/font/google";
import { getDropActivo, TEMA_POR_DEFECTO } from "@/lib/drops";
import { SITIO_URL } from "@/lib/marca";
import { variablesDeTema } from "@/lib/tema";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const sedgwick = Sedgwick_Ave_Display({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-sedgwick",
  display: "swap",
});

const pirata = Pirata_One({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-pirata",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: {
    default: "CGA Training Hard · Constancia, Ganas y Actitud",
    template: "%s · CGA Training Hard",
  },
  description:
    "Ropa de jiu-jitsu y streetwear en ediciones limitadas, sin reposiciones. Constancia, Ganas y Actitud. Siempre humildes, nunca sumisos.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "CGA Training Hard",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const drop = await getDropActivo();
  const tema = drop?.tema ?? TEMA_POR_DEFECTO;

  return (
    <html
      lang="es-ES"
      data-drop={tema.slug}
      style={variablesDeTema(tema)}
      className={`${archivo.variable} ${sedgwick.variable} ${pirata.variable}`}
    >
      <body className="min-h-dvh bg-negro text-blanco antialiased">{children}</body>
    </html>
  );
}
