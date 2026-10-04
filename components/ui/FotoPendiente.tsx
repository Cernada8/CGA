/** Hueco de foto hasta que lleguen las reales. Mantiene la proporción para que no haya CLS. */
export function FotoPendiente({ alt, proporcion = "4/5", fondo = "gris" }: { alt: string; proporcion?: string; fondo?: "gris" | "campana" }) {
  return (
    <div
      role="img"
      aria-label={`${alt} (foto pendiente)`}
      className={`grid w-full place-items-center ${fondo === "gris" ? "bg-gris-foto text-negro" : "bg-campana text-sobre-acento"}`}
      style={{ aspectRatio: proporcion }}
    >
      <span className="font-sello text-lg">[FOTO]</span>
    </div>
  );
}
