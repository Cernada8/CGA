// Validación de formularios del panel. Todo lo que llega de un formulario se trata como no fiable:
// se recorta, se limita y se comprueba aquí antes de tocar la base (que además tiene sus propias reglas).

export type Errores = Record<string, string>;
export type Resultado = { ok: boolean; mensaje?: string; errores?: Errores; id?: string };

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function texto(fd: FormData, campo: string, max: number): string {
  const v = fd.get(campo);
  if (typeof v !== "string") return "";
  // Fuera caracteres de control (salvo saltos de línea) y espacios sobrantes
  return v.replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "").trim().slice(0, max);
}

export function uuid(fd: FormData, campo: string): string | null {
  const v = texto(fd, campo, 36).toLowerCase();
  return UUID.test(v) ? v : null;
}

export function casilla(fd: FormData, campo: string): boolean {
  return fd.get(campo) === "on" || fd.get(campo) === "true";
}

export function entero(fd: FormData, campo: string, min: number, max: number): number | null | "invalido" {
  const v = texto(fd, campo, 10);
  if (!v) return null;
  if (!/^\d+$/.test(v)) return "invalido";
  const n = Number(v);
  return n >= min && n <= max ? n : "invalido";
}

export function unoDe<T extends string>(fd: FormData, campo: string, opciones: readonly T[], porDefecto: T): T {
  const v = texto(fd, campo, 40) as T;
  return opciones.includes(v) ? v : porDefecto;
}

export const CATEGORIAS = [
  "Camiseta",
  "Sudadera",
  "Chaqueta",
  "Rashguard",
  "Shorts",
  "Mallas",
  "Top",
  "Gorra",
  "Gorro",
  "Toalla",
  "Kimono",
  "Otra",
] as const;

export const LINEAS = [
  { valor: "general", texto: "General" },
  { valor: "woman", texto: "CGA Woman" },
  { valor: "kids", texto: "CGA Kids" },
] as const;

export const ACENTOS = [
  { valor: "#a39c84", texto: "Caqui (el del gorila)" },
  { valor: "#f2b705", texto: "Oro" },
  { valor: "#ff2a1f", texto: "Rojo" },
  { valor: "#4d8dff", texto: "Azul" },
  { valor: "#ff2e93", texto: "Rosa flúor" },
] as const;

/** Reglas de contraseña. Devuelve la lista de lo que falta (vacía = válida). */
export function problemasContrasena(clave: string, email: string): string[] {
  const p: string[] = [];
  if (clave.length < 12) p.push("Al menos 12 caracteres.");
  if (clave.length > 72) p.push("Como mucho 72 caracteres.");
  if (!/[a-zñ]/.test(clave) || !/[A-ZÑ]/.test(clave)) p.push("Mayúsculas y minúsculas.");
  if (!/\d/.test(clave)) p.push("Algún número.");
  const baja = clave.toLowerCase();
  const usuario = email.split("@")[0]?.toLowerCase() ?? "";
  if ((usuario && baja.includes(usuario)) || /cga|training|hard|contrase|password|123456|qwerty/.test(baja)) {
    p.push("Que no contenga tu correo, «CGA», «password» ni secuencias típicas.");
  }
  if (/(.)\1{3,}/.test(clave)) p.push("Sin repetir el mismo carácter 4 veces seguidas.");
  return p;
}
