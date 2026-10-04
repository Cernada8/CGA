import { Archivo } from "@/components/secciones/Archivo";
import { Colaboraciones } from "@/components/secciones/Colaboraciones";
import { ComoConseguirlo } from "@/components/secciones/ComoConseguirlo";
import { Costura } from "@/components/secciones/Costura";
import { CuentaAtras } from "@/components/secciones/CuentaAtras";
import { DropActual } from "@/components/secciones/DropActual";
import { Historia } from "@/components/secciones/Historia";
import { Manifiesto } from "@/components/secciones/Manifiesto";
import { Pie } from "@/components/secciones/Pie";
import { Rotura } from "@/components/secciones/Rotura";
import { Cabecera } from "@/components/ui/Cabecera";
import { getArchivo, getDropActivo, getProximoDrop } from "@/lib/drops";
import { EMAIL_CONTACTO, INSTAGRAM_URL, SITIO_URL } from "@/lib/marca";

export default async function Inicio() {
  const [dropActivo, proximo, archivo] = await Promise.all([getDropActivo(), getProximoDrop(), getArchivo()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CGA Training Hard",
    url: SITIO_URL,
    slogan: "Siempre humildes, nunca sumisos",
    description: "Ropa de jiu-jitsu y streetwear en ediciones cortas. Constancia, Ganas y Actitud.",
    email: EMAIL_CONTACTO,
    sameAs: [INSTAGRAM_URL],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Cabecera />
      <main id="contenido">
        <Manifiesto />
        <Historia />
        <DropActual drop={dropActivo} />
        <Rotura
          ancho="min(50vw, 240px)"
          sizes="(max-width: 480px) 50vw, 240px"
          arriba="bg-carbon"
          abajo="bg-negro grano"
          margen="-mt-12 -mb-12 lg:-mt-16 lg:-mb-16"
        />
        <CuentaAtras drop={proximo} />
        <Archivo prendas={archivo} />
        <ComoConseguirlo />
        <Colaboraciones />
        <Costura
          src="/grafiti/abuso-papa.webp"
          alt="Grafiti con las palabras «Abuso Papa» en letras blancas con contorno rojo"
          width={1390}
          height={980}
          ancho="min(88vw, 680px)"
          sizes="(max-width: 773px) 88vw, 680px"
          arriba="bg-carbon grano"
          abajo="bg-negro"
        />
      </main>
      <Pie bordeSuperior={false} />
    </>
  );
}
