import { Cinta } from "@/components/ui/Cinta";
import { AnimarReveal } from "@/components/animacion/AnimarReveal";
import { VideoHistoria } from "./VideoHistoria";

// El texto largo («Un chico. Un tatami.») sigue retirado a petición del cliente: aquí solo va el vídeo.
export function Historia() {
  return (
    <section aria-labelledby="historia" className="border-t border-gris-oscuro">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Cinta id="historia">De dónde venimos</Cinta>
          <p className="max-w-sm border-l-4 border-acento pl-5 font-sello text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.05]">
            Siempre humildes, nunca sumisos.
          </p>
        </div>
        <div className="mt-12">
          <AnimarReveal clip escala={1.08}>
            <VideoHistoria />
          </AnimarReveal>
        </div>
      </div>
    </section>
  );
}
