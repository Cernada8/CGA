import { Archivo } from "@/components/secciones/Archivo";
import { Colaboraciones } from "@/components/secciones/Colaboraciones";
import { ComoConseguirlo } from "@/components/secciones/ComoConseguirlo";
import { Costura } from "@/components/secciones/Costura";
import { CuentaAtras } from "@/components/secciones/CuentaAtras";
import { DropActual } from "@/components/secciones/DropActual";
import { Embajadores } from "@/components/secciones/Embajadores";
import { Historia } from "@/components/secciones/Historia";
import { Manifiesto } from "@/components/secciones/Manifiesto";
import { Pie } from "@/components/secciones/Pie";
import { Rotura } from "@/components/secciones/Rotura";
import { AnimarRotura } from "@/components/animacion/AnimarRotura";
import { AvisoDrop } from "@/components/ui/AvisoDrop";
import { Cabecera } from "@/components/ui/Cabecera";
import { Puerta } from "@/components/laberinto/Puerta";
import { getArchivo, getDropActivo, getProximoDrop } from "@/lib/drops";
import { EMAIL_CONTACTO, INSTAGRAM_URL, SITIO_URL } from "@/lib/marca";

// Con Supabase: la página se regenera como mucho cada minuto (y al momento cuando se guarda algo en el panel).
// Así una prenda programada aparece en «Lo nuevo» en cuanto llega su hora.
export const revalidate = 60;

export default async function Inicio() {
  const [dropActivo, proximo, archivo] = await Promise.all([getDropActivo(), getProximoDrop(), getArchivo()]);

  // Recordatorio de la próxima prenda (cabecera en escritorio, barra abajo en móvil)
  const fechaProxima = proximo?.fechaLanzamiento ?? null;
  const aviso = fechaProxima
    ? {
        fecha: fechaProxima,
        texto: `La próxima sale el ${new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" }).format(new Date(fechaProxima))}`,
      }
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CGA Training Hard",
    url: SITIO_URL,
    slogan: "Siempre humildes, nunca sumisos",
    description: "Ropa de jiu-jitsu y streetwear en ediciones limitadas, sin reposiciones. Constancia, Ganas y Actitud.",
    email: EMAIL_CONTACTO,
    sameAs: [INSTAGRAM_URL],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Cabecera
        centro={aviso ? <AvisoDrop variante="cabecera" fechaIso={aviso.fecha} textoInicial={aviso.texto} /> : null}
      />
      <main id="contenido">
        <Manifiesto />
        <DropActual drop={dropActivo} hayArchivo={archivo.length > 0} />
        <AnimarRotura>
          <Rotura
            ancho="min(50vw, 240px)"
            sizes="(max-width: 480px) 50vw, 240px"
            arriba="bg-carbon"
            abajo="bg-negro grano"
            margen="-mt-12 -mb-12 lg:-mt-16 lg:-mb-16"
          />
        </AnimarRotura>
        <CuentaAtras drop={proximo} />
        {/* «Ya no hay» solo aparece cuando de verdad hay algo agotado: una sección vacía resta, no suma */}
        {archivo.length > 0 ? <Archivo prendas={archivo} /> : null}
        <Historia />
        <Embajadores />
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
        {/* Barra fija de móvil: dentro de <main> para que quede inert mientras la puerta está cerrada */}
        {aviso ? <AvisoDrop variante="barra" fechaIso={aviso.fecha} textoInicial={aviso.texto} /> : null}
      </main>
      <Pie bordeSuperior={false} />
      <Puerta />
    </>
  );
}
