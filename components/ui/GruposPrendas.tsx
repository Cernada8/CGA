import type { Grupo } from "@/lib/categorias";

/** Atajos a cada familia de prendas (Camisetas, Sudaderas…). Solo si hay varias: con una o dos no hacen falta. */
export function AtajosGrupos({ seccion, nombreSeccion, grupos }: { seccion: string; nombreSeccion: string; grupos: Grupo[] }) {
  if (grupos.length < 3) return null;
  return (
    <nav aria-label={`Familias de «${nombreSeccion}»`} className="mt-10">
      <ul className="atajos-grupos">
        {grupos.map((g) => (
          <li key={g.id}>
            <a href={`#${seccion}-${g.id}`}>{g.nombre}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Cabecera de una familia: nombre y una línea que separa del grupo anterior */
export function TituloGrupo({ seccion, grupo }: { seccion: string; grupo: Grupo }) {
  return (
    <h3 id={`${seccion}-${grupo.id}`} className="grupo-prendas__titulo">
      {grupo.nombre}
    </h3>
  );
}

/** Columnas según la forma de las fotos: las apaisadas (delante y detrás lado a lado) piden más ancho */
export function clasesRejilla(grupo: Grupo) {
  return grupo.apaisado ? "grupo-prendas__rejilla grupo-prendas__rejilla--apaisada" : "grupo-prendas__rejilla";
}
