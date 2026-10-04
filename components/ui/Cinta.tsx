/** Titular de sección sobre una tira de cinta americana. */
export function Cinta({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="cinta font-grito text-3xl leading-tight sm:text-4xl">
      {children}
    </h2>
  );
}
