import { BotonInstagram } from "@/components/ui/BotonInstagram";
import type { Drop } from "@/lib/drops";
import { Reloj } from "./Reloj";

const FRASES = ["Ediciones limitadas", "Pocas unidades", "Sin reposiciones"] as const;

/** Cinta americana que cruza la pantalla con el lema de la exclusividad (se desliza muy despacio). */
function CintaLema({ inclinacion }: { inclinacion: "izq" | "der" }) {
  const tira = Array.from({ length: 4 }, () => FRASES).flat();
  return (
    <div aria-hidden="true" className={`cinta-lema cinta-lema--${inclinacion}`}>
      <div className="cinta-lema__pista">
        {[0, 1].map((copia) => (
          <span key={copia} className="cinta-lema__grupo">
            {tira.map((f, i) => (
              <span key={i} className="cinta-lema__frase">
                {f}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CuentaAtras({ drop }: { drop: Drop | null }) {
  const fecha = drop?.fechaLanzamiento ?? null;
  return (
    <section aria-labelledby="lo-proximo" className="grano relative overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-28 text-center sm:px-6 lg:pt-32 lg:pb-40">
        <h2 id="lo-proximo" className="font-sello text-2xl text-acento sm:text-3xl">
          Lo próximo
        </h2>
        {fecha ? (
          <div className="mx-auto max-w-3xl">
            <Reloj fechaIso={fecha} />
          </div>
        ) : (
          <p className="mt-4 pb-[0.12em] font-grito text-[clamp(4rem,16vw,11rem)] leading-[0.9]">Muy pronto</p>
        )}
        <p className="mx-auto mt-10 max-w-md text-lg lg:mt-20 text-blanco/85 sm:text-xl">
          Sale una vez. No hay reposición. Sigue nuestros Reels y entérate antes que nadie.
        </p>
        <div className="mt-10 hidden justify-center md:flex">
          <BotonInstagram />
        </div>
      </div>
      <CintaLema inclinacion="izq" />
    </section>
  );
}
