import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main id="contenido" className="grano grid min-h-dvh place-items-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="font-grito text-[clamp(3rem,12vw,7rem)] leading-[0.9]">Aquí no hay nada</h1>
        <p className="mt-6 text-lg text-blanco/90">Levántate y vuelve al inicio.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-acento px-6 font-bold text-sobre-acento hover:bg-blanco">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
