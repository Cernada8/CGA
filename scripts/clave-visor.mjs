// Genera la huella de la contraseña del acceso «solo ver» (VISOR_CLAVE_HASH).
// La contraseña se escribe aquí, sin que se vea en pantalla, y no se guarda en ningún sitio:
// solo sale su huella (scrypt), que es lo que se pega en Vercel.
//   npm run visor:clave
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

function preguntarOculto(texto) {
  return new Promise((resolver) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => rl.output.write(s.includes(texto) ? s : "");
    rl.question(texto, (r) => {
      rl.close();
      process.stdout.write("\n");
      resolver(r);
    });
  });
}

const clave = (await preguntarOculto("Contraseña nueva (no se ve al escribir): ")).normalize("NFC");
const repetida = (await preguntarOculto("Repítela: ")).normalize("NFC");
if (clave !== repetida) throw new Error("No coinciden.");
if (clave.length < 12 || !/[a-z]/.test(clave) || !/[A-Z]/.test(clave) || !/\d/.test(clave)) {
  throw new Error("Mínimo 12 caracteres, con mayúsculas, minúsculas y algún número.");
}
const [N, r, p] = [16384, 8, 1];
const sal = randomBytes(16);
const hash = scryptSync(clave, sal, 32, { N, r, p });
console.log("\nPega esto en Vercel como VISOR_CLAVE_HASH (producción):\n");
console.log(`scrypt$${N}$${r}$${p}$${sal.toString("base64")}$${hash.toString("base64")}\n`);
