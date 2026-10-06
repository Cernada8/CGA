/** Hueco de foto hasta que lleguen las reales: oscuro, con la insignia en marca de agua y el aviso [FOTO].
 *  Mantiene la proporción para que no haya CLS. */
export function FotoPendiente({ alt, proporcion = "4/5" }: { alt: string; proporcion?: string; fondo?: "gris" | "campana" }) {
  return (
    <div role="img" aria-label={`${alt} (foto pendiente)`} className="foto-pendiente" style={{ aspectRatio: proporcion }}>
      <span aria-hidden="true" className="foto-pendiente__marca" />
      <span className="pendiente relative text-sm">[FOTO]</span>
    </div>
  );
}
