import type { Metadata, Viewport } from "next";
import { getDropActivo, TEMA_POR_DEFECTO } from "@/lib/drops";
import { clasesFuentes } from "@/lib/fuentes";
import { SITIO_URL } from "@/lib/marca";
import { scriptInicio } from "@/lib/puerta";
import { variablesDeTema } from "@/lib/tema";
import "./globals.css";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const drop = await getDropActivo();
  const tema = drop?.tema ?? TEMA_POR_DEFECTO;

  return (
    <html
      lang="es-ES"
      suppressHydrationWarning // el script del <head> añade las clases puerta y anim antes de hidratar
      data-drop={tema.slug}
      style={variablesDeTema(tema)}
      className={clasesFuentes}
    >
      <head>
        {/* Antes de pintar: si toca mostrar la puerta de entrada (html.con-puerta) y el estado inicial
            de la portada (html.anim). Ver lib/puerta.ts. */}
        <script dangerouslySetInnerHTML={{ __html: scriptInicio(process.env.NEXT_PUBLIC_SIN_ANIMACIONES !== "1") }} />
      </head>
      <body className="min-h-dvh bg-negro text-blanco antialiased">
        {children}
      </body>
    </html>
  );
}
