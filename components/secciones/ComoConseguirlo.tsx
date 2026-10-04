import { Cinta } from "@/components/ui/Cinta";
import { INSTAGRAM_DM_URL } from "@/lib/marca";

const PASOS = ["Escríbenos por Instagram.", "Dinos modelo y talla.", "Te lo mandamos a casa."] as const;

export function ComoConseguirlo() {
  return (
    <section aria-labelledby="como-conseguirlo" className="border-t border-gris-oscuro">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="como-conseguirlo">Cómo conseguirlo</Cinta>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {PASOS.map((paso, i) => (
            <li key={paso} className="border-t border-gris-oscuro pt-5">
              <span aria-hidden="true" className="font-sello text-6xl text-acento">
                {i + 1}
              </span>
              <p className="mt-3 text-2xl font-bold leading-tight [font-stretch:85%]">{paso}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href={INSTAGRAM_DM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center rounded-full border-2 border-acento px-6 font-bold [font-stretch:90%] transition-colors duration-300 ease-out hover:bg-acento hover:text-sobre-acento"
          >
            Escríbenos por Instagram
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          <p className="text-lg text-gris">Envíos a toda España.</p>
        </div>
      </div>
    </section>
  );
}
