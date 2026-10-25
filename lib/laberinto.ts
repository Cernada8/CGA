// Lógica pura del laberinto de entrada: generación determinista por semilla, movimiento y solución.
// Sin DOM: se usa igual en el componente y en las pruebas.

export type Direccion = "arriba" | "abajo" | "izquierda" | "derecha";

/** Bits de paso abierto en cada celda */
export const PASO: Record<Direccion, number> = { arriba: 1, derecha: 2, abajo: 4, izquierda: 8 };
const DELTA: Record<Direccion, [number, number]> = {
  arriba: [0, -1],
  derecha: [1, 0],
  abajo: [0, 1],
  izquierda: [-1, 0],
};
const OPUESTA: Record<Direccion, Direccion> = { arriba: "abajo", abajo: "arriba", izquierda: "derecha", derecha: "izquierda" };
export const DIRECCIONES: Direccion[] = ["arriba", "derecha", "abajo", "izquierda"];

export type Celda = { x: number; y: number };
export type Laberinto = {
  columnas: number;
  filas: number;
  semilla: number;
  /** pasos[y * columnas + x] = máscara de bits PASO */
  pasos: Uint8Array;
  inicio: Celda;
  /** La salida se abre por el borde derecho de esta celda */
  salida: Celda;
};

/** Generador pseudoaleatorio mulberry32: misma semilla, mismo laberinto. */
export function aleatorio(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Backtracking recursivo (iterativo) desde la esquina superior izquierda. */
export function generar(columnas: number, filas: number, semilla: number): Laberinto {
  const azar = aleatorio(semilla);
  const pasos = new Uint8Array(columnas * filas);
  const visto = new Uint8Array(columnas * filas);
  const pila: Celda[] = [{ x: 0, y: 0 }];
  visto[0] = 1;
  while (pila.length) {
    const c = pila[pila.length - 1];
    const vecinas = DIRECCIONES.filter((d) => {
      const [dx, dy] = DELTA[d];
      const nx = c.x + dx;
      const ny = c.y + dy;
      return nx >= 0 && ny >= 0 && nx < columnas && ny < filas && !visto[ny * columnas + nx];
    });
    if (!vecinas.length) {
      pila.pop();
      continue;
    }
    const d = vecinas[Math.floor(azar() * vecinas.length)];
    const [dx, dy] = DELTA[d];
    const n = { x: c.x + dx, y: c.y + dy };
    pasos[c.y * columnas + c.x] |= PASO[d];
    pasos[n.y * columnas + n.x] |= PASO[OPUESTA[d]];
    visto[n.y * columnas + n.x] = 1;
    pila.push(n);
  }
  return { columnas, filas, semilla, pasos, inicio: { x: 0, y: 0 }, salida: { x: columnas - 1, y: filas - 1 } };
}

export function abierto(l: Laberinto, c: Celda, d: Direccion): boolean {
  return (l.pasos[c.y * l.columnas + c.x] & PASO[d]) !== 0;
}

export function salidasDe(l: Laberinto, c: Celda): Direccion[] {
  return DIRECCIONES.filter((d) => abierto(l, c, d));
}

export function esSalida(l: Laberinto, c: Celda): boolean {
  return c.x === l.salida.x && c.y === l.salida.y;
}

/**
 * Avanza en una dirección hasta el siguiente cruce, callejón o la salida (como correr por un pasillo).
 * Devuelve las celdas recorridas sin incluir la de partida; vacío si hay pared.
 */
export function correr(l: Laberinto, desde: Celda, d: Direccion): Celda[] {
  const recorrido: Celda[] = [];
  let c = desde;
  let dir = d;
  while (abierto(l, c, dir)) {
    const [dx, dy] = DELTA[dir];
    c = { x: c.x + dx, y: c.y + dy };
    recorrido.push(c);
    if (esSalida(l, c)) break;
    const opciones = salidasDe(l, c).filter((o) => o !== OPUESTA[dir]);
    // Sigue solo por pasillos sin desvíos; en las curvas también, para no obligar a pulsar en cada esquina
    if (opciones.length !== 1) break;
    dir = opciones[0];
  }
  return recorrido;
}

/** Camino más corto (BFS) de `desde` a la salida, incluida la celda de partida. */
export function resolver(l: Laberinto, desde: Celda = l.inicio): Celda[] {
  const n = l.columnas * l.filas;
  const previo = new Int32Array(n).fill(-1);
  const inicio = desde.y * l.columnas + desde.x;
  const meta = l.salida.y * l.columnas + l.salida.x;
  previo[inicio] = inicio;
  const cola = [inicio];
  while (cola.length) {
    const i = cola.shift()!;
    if (i === meta) break;
    const c = { x: i % l.columnas, y: Math.floor(i / l.columnas) };
    for (const d of salidasDe(l, c)) {
      const [dx, dy] = DELTA[d];
      const j = (c.y + dy) * l.columnas + (c.x + dx);
      if (previo[j] === -1) {
        previo[j] = i;
        cola.push(j);
      }
    }
  }
  const camino: Celda[] = [];
  for (let i = meta; ; i = previo[i]) {
    camino.unshift({ x: i % l.columnas, y: Math.floor(i / l.columnas) });
    if (i === inicio || previo[i] === -1) break;
  }
  return camino;
}

/** Dirección entre dos celdas contiguas */
export function direccionEntre(a: Celda, b: Celda): Direccion {
  if (b.x > a.x) return "derecha";
  if (b.x < a.x) return "izquierda";
  return b.y > a.y ? "abajo" : "arriba";
}

/** Semilla que da un laberinto con una solución de longitud razonable (ni trivial ni eterna). */
export function semillaJugable(columnas: number, filas: number, base: number): number {
  const minimo = Math.round((columnas + filas) * 1.3);
  const maximo = Math.round(columnas * filas * 0.55);
  for (let s = base, i = 0; i < 200; i++, s = (s * 1664525 + 1013904223) >>> 0) {
    const largo = resolver(generar(columnas, filas, s)).length;
    if (largo >= minimo && largo <= maximo) return s;
  }
  return base;
}
