import type { Grupo } from "@/lib/categorias";
import type { Producto } from "@/lib/drops";

/** Atajos a cada familia de prendas (Camisetas, Sudaderas…). Solo si hay varias: con una o dos no hacen falta. */
export function AtajosGrupos({ seccion, nombreSeccion, grupos }: { seccion: string; nombreSeccion: string; grupos: Grupo[] }) {
  if (grupos.length < 3) return null;
  return (
    <nav aria-label={`Familias de «${nombreSeccion}»`} className="mt-10">
      <ul className="atajos-grupos">
        {grupos.map((g) => (
          <li key={g.id}>
            <a href={`#${seccion}-${g.id}`}>{g.nombre}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Cabecera de una familia: nombre y una línea que separa del grupo anterior */
export function TituloGrupo({ seccion, grupo }: { seccion: string; grupo: Grupo }) {
  return (
    <h3 id={`${seccion}-${grupo.id}`} className="grupo-prendas__titulo">
      {grupo.nombre}
    </h3>
  );
}

/** Columnas según la forma de las fotos: las apaisadas (delante y detrás lado a lado) piden más ancho */
export function clasesRejilla(grupo: Grupo, { carril = false }: { carril?: boolean } = {}) {
  return ["grupo-prendas__rejilla", grupo.apaisado && "grupo-prendas__rejilla--apaisada", carril && "grupo-prendas__rejilla--carril"].filter(Boolean).join(" ");
}

/**
 * Proporción (ancho / alto) de la foto principal, para la rejilla «justificada»: cada ficha recibe un ancho
 * proporcional a su foto, así todas las fotos de una fila miden exactamente lo mismo de alto y la fila llena
 * todo el ancho. Las fotos no se recortan ni se tocan: solo se colocan.
 */
function proporcion(producto: Producto): number {
  const foto = producto.imagenes[0];
  return foto?.ruta && foto.ancho && foto.alto ? foto.ancho / foto.alto : 0.8;
}

export function proporcionFoto(producto: Producto): React.CSSProperties {
  return { "--r": proporcion(producto).toFixed(4) } as React.CSSProperties;
}

type Fila = { productos: Producto[]; suma: number; llena: boolean };

/** Reparte en filas (en orden) hasta que la suma de proporciones se acerca al objetivo de la pantalla */
function repartir(productos: Producto[], objetivo: number): Fila[] {
  const filas: Fila[] = [];
  let actual: Producto[] = [];
  let suma = 0;
  for (const p of productos) {
    actual.push(p);
    suma += proporcion(p);
    if (suma >= objetivo * 0.85) {
      filas.push({ productos: actual, suma, llena: true });
      actual = [];
      suma = 0;
    }
  }
  if (actual.length) {
    const ultima = filas.at(-1);
    // Lo que sobra al final: si es poco, se suma a la fila anterior (sale algo más baja, pero llena);
    // si no, va en su propia fila, a la misma altura que las demás (sin estirarse)
    if (ultima && suma < objetivo * 0.45) {
      ultima.productos.push(...actual);
      ultima.suma += suma;
    } else filas.push({ productos: actual, suma, llena: suma >= objetivo * 0.7 });
  }
  return filas;
}

/**
 * Filas «justificadas» calculadas en el servidor, como Google Fotos: en cada fila, cada prenda recibe un ancho
 * proporcional a su foto (ancho / alto), así TODAS las fotos de la fila miden lo mismo de alto y la fila va de
 * lado a lado. Las fotos no se recortan ni se tocan: solo se colocan. Una disposición por tamaño de pantalla:
 * - móvil: las apaisadas (delante y detrás lado a lado) solas a todo el ancho; las demás de dos en dos
 *   (primero las parejas, luego las apaisadas); si sobra una, sola al 62 %;
 * - tableta y escritorio: filas por orden hasta llenar el ancho (unas 3 y 4,6 «fotos cuadradas» por fila).
 * Devuelve, por prenda, las variables CSS de cada pantalla (orden, parte de la fila y prendas en la fila).
 */
export function filasJustificadas(productos: Producto[], { movil = true }: { movil?: boolean } = {}): Map<string, React.CSSProperties> {
  const estilos = new Map<string, Record<string, string | number>>(productos.map((p) => [p.id, {}]));
  const anotar = (sufijo: string, filas: Fila[], objetivo: number) => {
    let orden = 0;
    for (const f of filas) {
      for (const p of f.productos) {
        const e = estilos.get(p.id)!;
        e[`--orden-${sufijo}`] = orden++;
        // Fila llena: reparto exacto. Fila corta al final: a la altura de una fila normal (no se estira)
        // Redondeo siempre hacia abajo: la suma de una fila nunca pasa del 100 % (si pasara, saltaría de línea)
        e[`--cuota-${sufijo}`] = (Math.floor((proporcion(p) / (f.llena ? f.suma : objetivo * 0.95)) * 1e6) / 1e6).toString();
        e[`--n-${sufijo}`] = f.productos.length;
      }
    }
  };
  if (movil) {
    const apaisada = (p: Producto) => proporcion(p) >= 1.2;
    const normales = productos.filter((p) => !apaisada(p));
    const filas: Fila[] = [];
    for (let i = 0; i < normales.length; i += 2) {
      const par = normales.slice(i, i + 2);
      const suma = par.reduce((t, p) => t + proporcion(p), 0);
      filas.push(par.length === 2 ? { productos: par, suma, llena: true } : { productos: par, suma: suma / 0.62, llena: true });
    }
    for (const p of productos.filter(apaisada)) filas.push({ productos: [p], suma: proporcion(p), llena: true });
    anotar("m", filas, 2);
  }
  anotar("t", repartir(productos, 3), 3);
  anotar("d", repartir(productos, 4.6), 4.6);
  return estilos as Map<string, React.CSSProperties>;
}
