import { Cinta } from "@/components/ui/Cinta";
import { INSTAGRAM_DM_URL } from "@/lib/marca";

const PASOS = [
  { titulo: "Escríbenos por Instagram.", detalle: "Un mensaje directo a @cga.training.hard." },
  { titulo: "Dinos modelo y talla.", detalle: "Si dudas con la talla, te ayudamos." },
  { titulo: "Te lo mandamos a casa.", detalle: "Envíos a toda España." },
] as const;

export function ComoConseguirlo() {
  return (
    <section aria-labelledby="como-conseguirlo" className="border-t border-gris-oscuro">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="como-conseguirlo" entradilla="Sin tienda online. Así de fácil.">
          Cómo conseguirlo
        </Cinta>
        <ol className="pasos mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {PASOS.map(({ titulo, detalle }, i) => (
            <li key={titulo} className="paso">
              <span aria-hidden="true" className="paso__numero">
                {i + 1}
              </span>
              <p className="mt-5 text-2xl font-bold leading-tight [font-stretch:85%]">{titulo}</p>
              <p className="mt-2 text-base text-gris">{detalle}</p>
            </li>
          ))}
        </ol>
        <a
          href={INSTAGRAM_DM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-14 inline-flex min-h-12 items-center rounded-full border-2 border-acento px-6 font-bold [font-stretch:90%] transition-colors duration-300 ease-out hover:bg-acento hover:text-sobre-acento"
        >
          Escríbenos por Instagram
          <span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      </div>
    </section>
  );
}
