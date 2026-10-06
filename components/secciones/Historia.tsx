import { Cinta } from "@/components/ui/Cinta";
import { AnimarReveal } from "@/components/animacion/AnimarReveal";
import { VideoHistoria } from "./VideoHistoria";

export function Historia() {
  return (
    <section aria-labelledby="historia" className="border-t border-gris-oscuro">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-28">
        <div>
          <Cinta id="historia">Un chico. Un tatami.</Cinta>
          <div className="mt-10 max-w-prose space-y-5 text-lg text-blanco/90">
            <p>
              CGA nace de una historia personal. Un chico empieza a entrenar jiu-jitsu y encuentra en el tatami una
              escuela de vida.
            </p>
            <p>
              El tatami enseña que no siempre se gana. Que vas a caer muchas veces. Que habrá días en los que querrás
              parar.
            </p>
            <p>Y enseña algo más: que siempre puedes levantarte, aprender y seguir.</p>
            <p>De ahí sale CGA. De llevar lo que pasa en el tatami a todo lo demás.</p>
          </div>
        </div>
        <div className="self-center border-l-4 border-acento pl-6 sm:pl-8">
          <p className="font-sello text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.02]">Siempre humildes, nunca sumisos.</p>
          <div className="mt-6 max-w-md space-y-3 text-base text-gris">
            <p>Hay gente que confunde ser tranquilo con ser débil.</p>
            <p>
              Puedes ser respetuoso y humilde y, a la vez, tener claro quién eres, cuáles son tus límites y por qué
              luchas.
            </p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <AnimarReveal clip escala={1.08}>
            <VideoHistoria />
          </AnimarReveal>
        </div>
      </div>
    </section>
  );
}
