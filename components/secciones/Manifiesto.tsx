import Image from "next/image";
import { AnimarPortada } from "@/components/animacion/AnimarPortada";
import { PolvoPortada } from "@/components/portada/PolvoPortada";

const PALABRAS = ["Constancia", "Ganas", "Actitud"] as const;

// Portada: una pantalla, el luchador y las tres palabras. Nada más.
// Las iniciales van más grandes: leídas de arriba abajo, forman CGA.
// Fondo: polvo de tatami que vaga solo (lámpara de lava) y se levanta al pasar el ratón o el dedo.
// En móvil, la misma foto que en escritorio: arriba a la derecha, con las palabras montadas sobre su parte baja.
export function Manifiesto() {
  return (
    <section aria-labelledby="manifiesto-titulo" className="portada grano relative h-svh min-h-[560px] overflow-hidden lg:min-h-[620px]">
      {/* Fondo vivo (solo cliente, en diferido) */}
      <PolvoPortada />
      <AnimarPortada>
        <div className="relative mx-auto h-full max-w-7xl px-4 sm:px-6">
          <figure data-anim="foto" className="portada-figura">
            <Image
              src="/hero/cga-luchador.webp"
              alt="Luchador con ropa de CGA lanzando un puñetazo con guantes de MMA"
              width={1032}
              height={1441}
              sizes="(min-width: 1024px) 680px, (min-width: 640px) 82vw, 108vw"
              priority
              className="portada-foto"
            />
          </figure>

          <div className="portada-texto">
            <h1 id="manifiesto-titulo" className="portada-titulo font-grito leading-[0.86] tracking-tight">
              {PALABRAS.map((palabra) => (
                // El tamaño va en la máscara para que su holgura (en em) crezca con la letra
                <span key={palabra} className="portada-mascara block text-[clamp(4.1rem,19vw,9rem)] lg:text-[clamp(5rem,min(16.5svh,10.5vw),13rem)]">
                  {/* Lector de pantalla: la palabra entera (partida en dos se leería «C onstancia») */}
                  <span className="sr-only">{`${palabra} `}</span>
                  <span data-anim="palabra" className="portada-linea" aria-hidden="true">
                    <span className="portada-inicial">{palabra[0]}</span>
                    <span>{palabra.slice(1)}</span>
                  </span>
                </span>
              ))}
            </h1>
          </div>
        </div>
      </AnimarPortada>
    </section>
  );
}
