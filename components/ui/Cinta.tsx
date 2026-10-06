/** Titular de sección sobre una tira de cinta americana, con su entradilla debajo. */
export function Cinta({ id, children, entradilla }: { id: string; children: React.ReactNode; entradilla?: React.ReactNode }) {
  return (
    <header className="max-w-2xl">
      <h2 id={id} className="cinta font-grito text-3xl leading-tight sm:text-4xl">
        {children}
      </h2>
      {entradilla ? <p className="mt-6 text-lg text-blanco/85 sm:text-xl">{entradilla}</p> : null}
    </header>
  );
}
