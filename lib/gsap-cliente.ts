// Carga diferida de GSAP: no entra en el JS inicial de ninguna página.
// Los plugins se registran una sola vez y la promesa se reutiliza.
import type { gsap as GsapTipo } from "gsap";
import type { ScrollTrigger as ScrollTriggerTipo } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextTipo } from "gsap/SplitText";

export type Motor = {
  gsap: typeof GsapTipo;
  ScrollTrigger: typeof ScrollTriggerTipo;
  SplitText: typeof SplitTextTipo;
};

let promesa: Promise<Motor> | null = null;

export function cargarMotor(): Promise<Motor> {
  if (!promesa) {
    promesa = Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(
      ([g, st, sp]) => {
        const gsap = g.gsap;
        gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
        gsap.defaults({ overwrite: "auto" });
        document.documentElement.dataset.gsap = "listo";
        return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
      },
    );
  }
  return promesa;
}
