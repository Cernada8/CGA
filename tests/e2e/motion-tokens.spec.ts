import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { CURVA_CSS, DURACION } from "../../lib/motion";

test("las variables CSS de movimiento coinciden con lib/motion.ts", () => {
  const css = readFileSync("app/globals.css", "utf8");
  const leer = (nombre: string) => css.match(new RegExp(`--${nombre}:\\s*([^;]+);`))?.[1].trim();
  for (const [k, v] of Object.entries(DURACION)) expect(leer(`mov-${k}`)).toBe(`${v}s`);
  for (const [k, v] of Object.entries(CURVA_CSS)) expect(leer(`mov-${k}`)).toBe(v);
});
