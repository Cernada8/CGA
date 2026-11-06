import { Archivo, Pirata_One, Sedgwick_Ave_Display } from "next/font/google";

// Fuentes de marca (cga-marca §5). Se comparten entre el layout y global-error, que no usa el layout.
// Solo el subconjunto «latin»: ya trae todo el español (á, é, í, ó, ú, ü, ñ, ¿, ¡). Con «latin-ext» se precargaban
// el doble de archivos (~230 KB) que competían con la foto de la portada.
// La gótica (Pirata) y la brush (Sedgwick) solo salen en títulos que no están arriba del todo: no se precargan.
// La de texto (Archivo) sí se precarga: la portada ya no tiene foto grande con la que compita, y lo primero
// que se lee (menú, botón de Instagram) va con ella.
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
export const sedgwick = Sedgwick_Ave_Display({ subsets: ["latin"], weight: "400", variable: "--font-sedgwick", display: "swap", preload: false });
export const pirata = Pirata_One({ subsets: ["latin"], weight: "400", variable: "--font-pirata", display: "swap", preload: false });

export const clasesFuentes = `${archivo.variable} ${sedgwick.variable} ${pirata.variable}`;
