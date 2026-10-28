import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pie } from "@/components/secciones/Pie";
import { BotonInstagram } from "@/components/ui/BotonInstagram";
import { Cabecera } from "@/components/ui/Cabecera";
import { FotoPrenda } from "@/components/ui/FotoPrenda";
import { getPrenda, getPrendas, type Producto } from "@/lib/drops";
import { INSTAGRAM_DM_URL } from "@/lib/marca";
import { variablesDeTema } from "@/lib/tema";

// Una página por prenda: se generan todas al publicar y, con Supabase, se refrescan como mucho cada minuto.
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getPrendas()).map(({ producto }) => ({ slug: producto.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ficha = await getPrenda((await params).slug);
  if (!ficha) return {};
  const { producto, agotada } = ficha;
  const nombre = producto.nombre ?? "Prenda";
  const foto = producto.imagenes[0];
  return {
    title: nombre,
    description: agotada
      ? `${nombre} de CGA Training Hard. Ya no hay: salió una vez y no vuelve.`
      : `${nombre} de CGA Training Hard. Edición limitada, sin reposiciones. Escríbenos por Instagram con el modelo y la talla.`,
    alternates: { canonical: `/prenda/${producto.slug}` },
    openGraph: foto?.ruta ? { images: [{ url: foto.ruta, width: foto.ancho, height: foto.alto, alt: foto.alt }] } : undefined,
  };
}

const NOMBRE_LINEA: Record<Producto["linea"], string | null> = { general: null, woman: "CGA Woman", kids: "CGA Kids" };

export default async function PaginaPrenda({ params }: Props) {
  const ficha = await getPrenda((await params).slug);
  if (!ficha) notFound();
  const { producto, tema, agotada, anterior, siguiente } = ficha;
  const nombre = producto.nombre ?? "Prenda de CGA";
  const seccion = agotada ? { id: "ya-no-hay", nombre: "Ya no hay" } : { id: "lo-nuevo", nombre: "Lo nuevo" };
  const linea = NOMBRE_LINEA[producto.linea];
  const datos = [
    producto.categoria ? { clave: "Prenda", valor: producto.categoria } : null,
    producto.gramajeG ? { clave: "Gramaje", valor: `${producto.gramajeG} g` } : null,
    linea ? { clave: "Línea", valor: linea } : null,
  ].filter((d): d is { clave: string; valor: string } => d !== null);

  return (
    <>
      <Cabecera />
      <main id="contenido" style={variablesDeTema(tema)} className="pt-16">
        <article className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:px-6 lg:pt-10">
          {/* Volver: lleva justo a la ficha de la que se vino */}
          <nav aria-label="Migas de pan" className="px-4 pt-3 sm:px-6 lg:col-span-2 lg:px-0 lg:pt-0 lg:pb-6">
            <Link href={`/#${producto.slug}`} className="volver">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M15 5l-7 7 7 7" />
              </svg>
              Volver a «{seccion.nombre}»
            </Link>
          </nav>

          {/* Nombre antes de la foto: en el móvil es lo primero que se lee (y lo primero que oye un lector de pantalla) */}
          <header className="px-4 pt-4 pb-6 sm:px-6 lg:col-start-2 lg:row-start-2 lg:px-0 lg:pt-2 lg:pb-0">
            <p className="font-sello text-xl text-acento sm:text-2xl">{seccion.nombre}</p>
            <h1 className="mt-2 text-[clamp(2.4rem,9vw,4.25rem)] leading-[0.95] font-black [font-stretch:80%] [text-wrap:balance]">{nombre}</h1>
          </header>

          {/* Foto: de lado a lado en el móvil (se puede ampliar con dos dedos), fija al hacer scroll en escritorio */}
          <div className="lg:sticky lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-2 lg:self-start">
            <figure className={`prenda__foto ${agotada ? "ficha--agotada" : ""}`}>
              <FotoPrenda imagen={producto.imagenes[0]} alt={nombre} sizes="(min-width: 1024px) 58vw, 100vw" prioridad />
              {agotada ? (
                <span className="sello-agotado" aria-hidden="true">
                  Agotado
                </span>
              ) : null}
            </figure>
            {producto.imagenes.slice(1).map((imagen, i) => (
              <figure key={imagen.ruta ?? i} className="prenda__foto mt-3">
                <FotoPrenda imagen={imagen} alt={imagen.alt} sizes="(min-width: 1024px) 58vw, 100vw" />
              </figure>
            ))}
          </div>

          <div className="px-4 pt-2 sm:px-6 lg:col-start-2 lg:row-start-3 lg:px-0">
            {datos.length > 0 ? (
              <dl className="prenda__datos mt-8">
                {datos.map((d) => (
                  <div key={d.clave}>
                    <dt>{d.clave}</dt>
                    <dd>{d.valor}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {producto.descripcion ? <p className="mt-8 max-w-prose text-lg text-blanco/90">{producto.descripcion}</p> : null}

            {agotada ? (
              <div className="mt-10 border-t border-gris-oscuro pt-8">
                <p className="text-2xl font-bold [font-stretch:85%]">Agotado. No vuelve.</p>
                <p className="mt-2 max-w-md text-lg text-blanco/85">Quien lo tiene, lo tiene. Lo próximo se anuncia en Instagram.</p>
                <div className="mt-8">
                  <BotonInstagram />
                </div>
              </div>
            ) : (
              // En el móvil el botón va fijo abajo, a mano del pulgar, desde el primer momento
              <div className="prenda__pedir">
                <a href={INSTAGRAM_DM_URL} target="_blank" rel="noopener noreferrer" className="boton-pedir">
                  Escríbenos por Instagram
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
                <p className="mt-3 text-center text-sm text-blanco/80 lg:text-left lg:text-base">
                  Dinos el modelo («{nombre}») y tu talla. Sale una vez: cuando se acaba, se acaba.
                </p>
              </div>
            )}

            {anterior || siguiente ? (
              <nav aria-label={`Más prendas de «${seccion.nombre}»`} className="prenda__mas">
                {anterior ? (
                  <Link href={`/prenda/${anterior.slug}`} className="prenda__vecina">
                    <span className="prenda__vecina-etiqueta">Anterior</span>
                    <span className="prenda__vecina-nombre">{anterior.nombre ?? "Prenda"}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {siguiente ? (
                  <Link href={`/prenda/${siguiente.slug}`} className="prenda__vecina prenda__vecina--siguiente">
                    <span className="prenda__vecina-etiqueta">Siguiente</span>
                    <span className="prenda__vecina-nombre">{siguiente.nombre ?? "Prenda"}</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </div>
        </article>
      </main>
      <Pie />
      {/* Hueco para que la barra fija de pedir (móvil) no tape el final del pie */}
      {agotada ? null : <div aria-hidden="true" className="h-36 lg:hidden" />}
    </>
  );
}
