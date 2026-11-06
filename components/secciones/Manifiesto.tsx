import { preload } from "react-dom";
import { AnimarPortada } from "@/components/animacion/AnimarPortada";
import { PolvoPortada } from "@/components/portada/PolvoPortada";
import { MarcaTexto } from "@/components/ui/Logo";

// Portada: una pantalla con el polvo de tatami de fondo y, en el centro, el logotipo horizontal en grande.
// Nada más. El logo se dimensiona con el lado más corto disponible, así cabe entero en la primera pantalla
// en cualquier dispositivo (móvil en vertical u horizontal, tableta, escritorio).
// El h1 es el propio logo: su nombre accesible («CGA Training Hard») es lo que leen Google y los lectores.
export function Manifiesto() {
  // Imagen fija del polvo (6 KB): se pide desde el principio para que el fondo esté desde el primer pintado
  preload("/hero/polvo-movil.webp", { as: "image", media: "(max-width: 1023px) and (orientation: portrait)" });
  preload("/hero/polvo-escritorio.webp", { as: "image", media: "(min-width: 1024px), (orientation: landscape)" });
  return (
    <section aria-labelledby="manifiesto-titulo" className="portada grano relative h-svh min-h-[420px] overflow-hidden">
      {/* Fondo vivo (solo cliente, en diferido) */}
      <PolvoPortada />
      <AnimarPortada>
        <div className="portada-centro">
          <h1 id="manifiesto-titulo" className="portada-logo" data-anim="logo">
            <MarcaTexto variante="horizontal" ancho="fluido" />
          </h1>
        </div>
      </AnimarPortada>
    </section>
  );
}
