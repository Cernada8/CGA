import { AnimarCinta } from "@/components/animacion/AnimarCinta";
import { BotonInstagram } from "@/components/ui/BotonInstagram";
import type { Drop } from "@/lib/drops";
import { Reloj } from "./Reloj";

const FRASES = ["Ediciones limitadas", "Pocas unidades", "Sin reposiciones"] as const;

/** Cinta americana que cruza la pantalla con el lema de la exclusividad (se desliza solo al hacer scroll). */
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

const FORMATO_DIA = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", timeZone: "Europe/Madrid" });
const FORMATO_HORA = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
const FORMATO_LARGO = new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Madrid" });

/** La prenda que viene, tapada con cinta americana: no se enseña hasta el día. */
function PrendaTapada({ dia }: { dia: string }) {
  return (
    <figure role="img" aria-label={`Prenda tapada con cinta americana. Se desvela el ${dia}.`} className="tapada">
      <span aria-hidden="true" className="foto-pendiente__marca" />
      <span aria-hidden="true" className="tapada__cinta tapada__cinta--a">
        Se desvela el {dia}
      </span>
      <span aria-hidden="true" className="tapada__cinta tapada__cinta--b">
        No se enseña antes
      </span>
    </figure>
  );
}

export function CuentaAtras({ drop }: { drop: Drop | null }) {
  const fecha = drop?.fechaLanzamiento ?? null;
  const instante = fecha ? new Date(fecha) : null;
  // «viernes, 30» → «Viernes 30»
  const dia = instante ? FORMATO_DIA.format(instante).replace(",", "").replace(/^./, (c) => c.toUpperCase()) : null;
  const diaCorto = instante ? `${instante.toLocaleDateString("es-ES", { day: "numeric", timeZone: "Europe/Madrid" })} de ${instante.toLocaleDateString("es-ES", { month: "long", timeZone: "Europe/Madrid" })}` : null;

  return (
    <section aria-labelledby="lo-proximo" className="grano relative scroll-mt-16 overflow-hidden">
      {instante && dia && diaCorto ? (
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-24 pb-36 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16 lg:pt-32 lg:pb-44">
          <div>
            <h2 id="lo-proximo" className="font-sello text-2xl text-acento sm:text-3xl">
              Lo próximo
            </h2>
            {/* La brush lleva el día; la fecha y la hora van en la grotesca (los números de la brush llevan el cero tachado) */}
            <p className="mt-3 font-grito text-[clamp(3.6rem,13vw,8.5rem)] leading-[0.88]">Sale el {dia.split(" ")[0].toLowerCase()}.</p>
            <p className="mt-4 text-[clamp(1.6rem,5vw,2.6rem)] font-black leading-tight [font-stretch:80%]">
              {diaCorto}, a las {FORMATO_HORA.format(instante)}
            </p>
            <Reloj fechaIso={fecha!} fechaLegible={FORMATO_LARGO.format(instante)} />
            <p className="mt-10 max-w-md text-lg text-blanco/90 sm:text-xl">
              Una prenda nueva. Una sola tirada. Cuando se acaba, se acaba.
            </p>
            <p className="mt-3 max-w-md text-gris">Sigue nuestros Reels y entérate antes que nadie.</p>
            <div className="mt-8 hidden md:flex">
              <BotonInstagram />
            </div>
          </div>
          <PrendaTapada dia={diaCorto} />
        </div>
      ) : (
        <div className="mx-auto max-w-5xl px-4 pt-24 pb-28 text-center sm:px-6 lg:pt-32 lg:pb-40">
          <h2 id="lo-proximo" className="font-sello text-2xl text-acento sm:text-3xl">
            Lo próximo
          </h2>
          <p className="mt-4 pb-[0.12em] font-grito text-[clamp(4rem,16vw,11rem)] leading-[0.9]">Muy pronto</p>
          <p className="mx-auto mt-10 max-w-md text-lg text-blanco/85 sm:text-xl">
            Sale una vez. No hay reposición. Sigue nuestros Reels y entérate antes que nadie.
          </p>
          <div className="mt-10 hidden justify-center md:flex">
            <BotonInstagram />
          </div>
        </div>
      )}
      <AnimarCinta>
        <CintaLema inclinacion="izq" />
      </AnimarCinta>
    </section>
  );
}
