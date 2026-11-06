import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Insignia, MarcaTexto } from "@/components/ui/Logo";
import { COLECCION } from "@/lib/coleccion";
import { getPrenda } from "@/lib/drops";
import { INSTAGRAM_USUARIO } from "@/lib/marca";
import "./tarjeta.css";

// Plantillas de las tarjetas para compartir (Open Graph / X / WhatsApp / Instagram), 1200 × 630.
// No se ven en la web: scripts/generar-tarjetas.mjs las abre con Playwright y las guarda como JPG.
// Solo existen en local o con CGA_RUTAS_DEV=1 (igual que el resto de /dev).
// Regla de oro: lo importante, en el centro (WhatsApp e Instagram recortan a cuadrado en algunas vistas).
export const metadata: Metadata = { title: "Tarjeta", robots: { index: false, follow: false } };

type Props = { params: Promise<{ tipo: string[] }> };

export default async function Tarjeta({ params }: Props) {
  if (process.env.NODE_ENV === "production" && process.env.CGA_RUTAS_DEV !== "1") notFound();
  const [tipo, slug] = (await params).tipo;
  if (tipo === "inicio") return <Marco><Inicio /></Marco>;
  if (tipo === "colaboraciones") return <Marco><Colaboraciones /></Marco>;
  if (tipo === "prenda" && slug) {
    const ficha = await getPrenda(slug);
    if (!ficha) notFound();
    return (
      <Marco>
        <Prenda ficha={ficha} />
      </Marco>
    );
  }
  notFound();
}

/** Lienzo común: polvo de la portada de fondo, grano y un filete fino caqui hacia dentro (acabado de etiqueta) */
function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div id="tarjeta" className="tarjeta grano">
      {children}
      <span className="tarjeta__filete" aria-hidden="true" />
    </div>
  );
}

function Pie({ variante }: { variante?: "prenda" }) {
  return (
    <div className={variante ? `tarjeta__pie tarjeta__pie--${variante}` : "tarjeta__pie"}>
      <Insignia tamano={56} alt="" prioridad />
      <span>@{INSTAGRAM_USUARIO}</span>
    </div>
  );
}

function Inicio() {
  return (
    <>
      <span className="tarjeta__halo" aria-hidden="true" />
      <div className="tarjeta__centro">
        <div style={{ width: 400 }}>
          <MarcaTexto variante="horizontal" ancho="fluido" />
        </div>
        <p className="tarjeta__lema">Constancia, Ganas y Actitud</p>
      </div>
      <Pie />
    </>
  );
}

function Colaboraciones() {
  const [camiseta, short] = COLECCION;
  return (
    <>
      <span className="tarjeta__halo tarjeta__halo--izquierda" aria-hidden="true" />
      <div className="tarjeta__columna">
        <p className="tarjeta__sello">Colaboraciones</p>
        <h1 className="tarjeta__titulo font-grito">Hagamos algo juntos</h1>
        <p className="tarjeta__texto">Equipaciones para academias, equipos y marcas.</p>
      </div>
      <div className="tarjeta__colgadas" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- plantilla para captura, no se sirve */}
        {camiseta ? <img src={camiseta.delante.src} alt="" className="tarjeta__pieza tarjeta__pieza--1" /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {short ? <img src={short.delante.src} alt="" className="tarjeta__pieza tarjeta__pieza--2" /> : null}
      </div>
      <Pie />
    </>
  );
}

function Prenda({ ficha }: { ficha: NonNullable<Awaited<ReturnType<typeof getPrenda>>> }) {
  const { producto, agotada } = ficha;
  const foto = producto.imagenes[0];
  const detalle = [producto.categoria, producto.gramajeG ? `${producto.gramajeG} g` : null].filter(Boolean).join(", ");
  return (
    <>
      <span className="tarjeta__halo tarjeta__halo--derecha" aria-hidden="true" />
      {/* La foto entera y sin recortar (como en la web): la caja toma su proporción dentro de 470 × 490 */}
      <div className="tarjeta__foto-hueco">
        <div className="tarjeta__foto" style={cajaFoto(foto?.ancho, foto?.alto)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- plantilla para captura, no se sirve */}
          {foto?.ruta ? <img src={foto.ruta} alt="" /> : null}
        </div>
      </div>
      <div className="tarjeta__ficha">
        <div style={{ width: 150 }}>
          <MarcaTexto variante="horizontal" ancho="fluido" />
        </div>
        <h1 className="tarjeta__nombre">{producto.nombre}</h1>
        <p className="tarjeta__detalle">{detalle}</p>
        <p className="tarjeta__estado">{agotada ? "Ya no hay. Salió una vez y no vuelve." : "Edición limitada. Sin reposiciones."}</p>
      </div>
      <Pie variante="prenda" />
    </>
  );
}

function cajaFoto(ancho = 1, alto = 1): React.CSSProperties {
  const [maxAncho, maxAlto] = [470, 490];
  const r = ancho / alto;
  return r > maxAncho / maxAlto ? { width: maxAncho, height: Math.round(maxAncho / r) } : { width: Math.round(maxAlto * r), height: maxAlto };
}
