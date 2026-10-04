import { Cinta } from "@/components/ui/Cinta";
import type { Drop } from "@/lib/drops";
import { Reloj } from "./Reloj";

export function CuentaAtras({ drop }: { drop: Drop | null }) {
  const fecha = drop?.fechaLanzamiento ?? null;
  return (
    <section aria-labelledby="lo-proximo" className="grano">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <Cinta id="lo-proximo">Lo próximo</Cinta>
        {fecha ? (
          <Reloj fechaIso={fecha} />
        ) : (
          <p className="mt-10 max-w-2xl text-[clamp(1.75rem,4.5vw,3rem)] font-bold leading-tight [font-stretch:85%]">
            Muy pronto. Síguenos para no perdértelo.
          </p>
        )}
        <p className="mt-8 max-w-xl text-lg text-gris">Sale una vez. No hay reposición.</p>
      </div>
    </section>
  );
}
