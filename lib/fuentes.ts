import { Archivo, Pirata_One, Sedgwick_Ave_Display } from "next/font/google";

// Fuentes de marca (cga-marca §5). Se comparten entre el layout y global-error, que no usa el layout.
export const archivo = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
export const sedgwick = Sedgwick_Ave_Display({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-sedgwick", display: "swap" });
export const pirata = Pirata_One({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-pirata", display: "swap" });

export const clasesFuentes = `${archivo.variable} ${sedgwick.variable} ${pirata.variable}`;
