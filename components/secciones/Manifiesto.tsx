import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { BotonInstagram } from "@/components/ui/BotonInstagram";

const PALABRAS = [
  { palabra: "Constancia", para: "para seguir." },
  { palabra: "Ganas", para: "para luchar." },
  { palabra: "Actitud", para: "para afrontar lo que venga." },
] as const;

const ESCRITORIO = "(min-width: 1024px)";
const SIZES_ESCRITORIO = "640px";
const SIZES_MOVIL = "(min-width: 640px) 640px, 100vw";
const GIF_VACIO = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

// Dirección de arte: en móvil y tableta, la foto de los dos luchadores; en escritorio, el luchador solo
// y más grande. Cada dispositivo descarga solo su foto.
function fuentesPortada() {
  const escritorio = getImageProps({
    alt: "Luchador con ropa de CGA lanzando un puñetazo con guantes de MMA",
    src: "/hero/cga-luchador.webp",
    width: 1032,
    height: 1441,
    sizes: SIZES_ESCRITORIO,
    priority: true,
  }).props;
  const movil = getImageProps({
    alt: "Dos luchadores con ropa de CGA entre una nube de polvo: uno grita con la camiseta del gorila y el otro lanza un puñetazo con guantes de MMA",
    src: "/hero/cga-luchadores.webp",
    width: 1122,
    height: 1402,
    sizes: SIZES_MOVIL,
    priority: true,
  }).props;
  return { escritorio, movil };
}

function FotoPortada({ srcSetEscritorio, movil }: { srcSetEscritorio: string; movil: ReturnType<typeof fuentesPortada>["movil"] }) {
  return (
    <picture className="contents">
      <source media={ESCRITORIO} srcSet={srcSetEscritorio} sizes={SIZES_ESCRITORIO} width={1032} height={1441} />
      {/* <picture> con dirección de arte: URLs optimizadas por getImageProps */}
      <img
        {...movil}
        alt={movil.alt}
        className="portada-foto mx-auto h-auto w-full max-w-[640px] lg:mx-0 lg:h-[115%] lg:w-auto lg:max-w-none lg:object-contain lg:object-top"
      />
    </picture>
  );
}

/** Fondo de escritorio: la misma foto, muy desenfocada, como luz de escenario en un gimnasio a oscuras.
 *  Por debajo de 1024 px el <img> es un GIF vacío: no descarga nada. */
function FondoDifuminado({ srcSetEscritorio }: { srcSetEscritorio: string }) {
  return (
    <div aria-hidden="true" className="portada-fondo">
      <picture>
        <source media={ESCRITORIO} srcSet={srcSetEscritorio} sizes={SIZES_ESCRITORIO} />
        <img src={GIF_VACIO} alt="" className="portada-fondo__foto" />
      </picture>
    </div>
  );
}

// Portada. En móvil la foto va arriba y las tres palabras se montan sobre su parte baja.
// En escritorio ocupa exactamente una pantalla: palabras a la izquierda y el luchador a la derecha,
// un 15 % más alto que el hueco, de modo que el borde de la sección lo corta por los muslos.
export function Manifiesto() {
  const { escritorio, movil } = fuentesPortada();
  const srcSetEscritorio = escritorio.srcSet!;

  // Precarga la foto que toca según el ancho (es el LCP)
  preload(escritorio.src, { as: "image", imageSrcSet: srcSetEscritorio, imageSizes: SIZES_ESCRITORIO, media: ESCRITORIO, fetchPriority: "high" });
  preload(movil.src, { as: "image", imageSrcSet: movil.srcSet, imageSizes: SIZES_MOVIL, media: "(max-width: 1023px)", fetchPriority: "high" });

  return (
    <section aria-labelledby="manifiesto-titulo" className="grano relative overflow-hidden lg:h-svh lg:min-h-[620px]">
      <FondoDifuminado srcSetEscritorio={srcSetEscritorio} />
      <div className="relative mx-auto grid h-full max-w-7xl px-4 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center">
        <figure className="relative -mx-4 sm:-mx-6 lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:flex lg:w-[58%] lg:items-start lg:justify-end lg:pt-[4.5rem] lg:pr-2">
          <FotoPortada srcSetEscritorio={srcSetEscritorio} movil={movil} />
        </figure>

        <div className="relative z-10 -mt-[30vw] pb-16 sm:-mt-40 lg:mt-0 lg:pt-6 lg:pb-0">
          <h1 id="manifiesto-titulo" className="portada-titulo font-grito leading-[0.88] tracking-tight">
            {PALABRAS.map(({ palabra, para }) => (
              <span key={palabra} className="block">
                <span className="block text-[clamp(3.6rem,15vw,9.5rem)] lg:text-[clamp(4.5rem,min(13.5svh,9vw),9.5rem)]">
                  {palabra}
                </span>
                <span className="-mt-1 mb-3 block font-texto text-base font-medium tracking-normal text-gris [font-stretch:100%] sm:text-lg lg:mb-[1.2svh]">
                  {para}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-xl text-lg text-blanco/90 sm:text-xl lg:mt-[3.5svh] lg:max-w-md">
            Ropa de jiu-jitsu y streetwear para quien vuelve al tatami al día siguiente. Sale en ediciones cortas.
            Cuando se acaba, se acaba.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-[4svh]">
            {/* En móvil el CTA ya está en la cabecera; aquí solo en escritorio para no repetirlo en la misma pantalla */}
            <div className="hidden md:block">
              <BotonInstagram />
            </div>
            <a href="#lo-nuevo" className="font-semibold underline decoration-acento decoration-2 underline-offset-8 hover:text-acento">
              Ver lo nuevo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
