/** Titular de sección sobre una tira de cinta americana, con su entradilla debajo. */
export function Cinta({ id, children, entradilla }: { id: string; children: React.ReactNode; entradilla?: React.ReactNode }) {
  return (
    <header className="max-w-2xl">
      <h2 id={id} className="cinta font-grito text-4xl leading-tight sm:text-5xl lg:text-6xl">
        {children}
      </h2>
      {entradilla ? <p className="mt-7 max-w-xl text-lg text-blanco/85 sm:text-xl">{entradilla}</p> : null}
    </header>
  );
}
