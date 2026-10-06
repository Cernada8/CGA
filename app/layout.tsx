import type { Metadata, Viewport } from "next";
import { getDropActivo, TEMA_POR_DEFECTO } from "@/lib/drops";
import { clasesFuentes } from "@/lib/fuentes";
import { SITIO_URL } from "@/lib/marca";
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
      suppressHydrationWarning // el script del <head> añade la clase anim antes de hidratar
      data-drop={tema.slug}
      style={variablesDeTema(tema)}
      className={clasesFuentes}
    >
      <head>
        {/* Estado inicial de la entrada de la portada: solo con JS y sin movimiento reducido.
            Si GSAP no llega en 2,5 s, se quita la clase y se ve todo. */}
        {process.env.NEXT_PUBLIC_SIN_ANIMACIONES === "1" ? null : (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("anim");setTimeout(function(){d.classList.remove("anim")},2500)}})();`,
            }}
          />
        )}
      </head>
      <body className="min-h-dvh bg-negro text-blanco antialiased">
        {children}
      </body>
    </html>
  );
}
