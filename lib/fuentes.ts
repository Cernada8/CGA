import { Archivo, Pirata_One, Sedgwick_Ave_Display } from "next/font/google";

// Fuentes de marca (cga-marca §5). Se comparten entre el layout y global-error, que no usa el layout.
// Solo el subconjunto «latin»: ya trae todo el español (á, é, í, ó, ú, ü, ñ, ¿, ¡). Con «latin-ext» se precargaban
// el doble de archivos (~230 KB) que competían con la foto de la portada.
// La gótica (Pirata) solo sale en sellos que no están arriba del todo: no se precarga.
// La de texto (Archivo, 89 KB por el eje de anchura) tampoco: hasta que llega se ve su sustituta con las mismas
// medidas (next/font la ajusta, sin saltos) y así no le quita ancho de banda a la foto de la portada.
// Solo se precarga la brush de las tres palabras de la portada.
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap", preload: false });
export const sedgwick = Sedgwick_Ave_Display({ subsets: ["latin"], weight: "400", variable: "--font-sedgwick", display: "swap" });
export const pirata = Pirata_One({ subsets: ["latin"], weight: "400", variable: "--font-pirata", display: "swap", preload: false });

export const clasesFuentes = `${archivo.variable} ${sedgwick.variable} ${pirata.variable}`;
