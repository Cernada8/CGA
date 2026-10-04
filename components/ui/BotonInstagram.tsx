import Image from "next/image";
import { INSTAGRAM_URL } from "@/lib/marca";

// Tres «posts» que asoman al pasar el ratón o al enfocar con teclado.
// Inspirado en el componente «Instagram Button» de Framer, hecho solo con CSS (sin JS ni librerías).
const POSTS = [
  { src: "/instagram/ig-1.webp", lado: "izq" },
  { src: "/instagram/ig-2.webp", lado: "centro" },
  { src: "/instagram/ig-3.webp", lado: "der" },
] as const;

type Props = {
  texto?: string;
  /** Hacia dónde salen los posts: «abajo» para la cabecera, «arriba» en el resto. */
  direccion?: "arriba" | "abajo";
  className?: string;
};

export function BotonInstagram({ texto = "Síguenos en Instagram", direccion = "arriba", className = "" }: Props) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-direccion={direccion}
      className={`boton-ig ${className}`}
    >
      <span aria-hidden="true" className="boton-ig__posts">
        {POSTS.map((post) => (
          <span key={post.src} className="post-ig" data-lado={post.lado}>
            <Image src={post.src} alt="" width={56} height={60} unoptimized className="post-ig__foto" />
            <span className="post-ig__iconos">
              <IconoCorazon />
              <IconoComentario />
              <IconoEnviar />
            </span>
            <span className="post-ig__texto" />
          </span>
        ))}
      </span>
      <span className="boton-ig__cara">
        <IconoInstagram />
        {texto}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </span>
    </a>
  );
}

function IconoInstagram() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONO = { width: 7, height: 7, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.6 } as const;

function IconoCorazon() {
  return (
    <svg {...ICONO}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}
function IconoComentario() {
  return (
    <svg {...ICONO}>
      <path d="M4 20l1.5-4A8 8 0 1 1 8 18.5z" />
    </svg>
  );
}
function IconoEnviar() {
  return (
    <svg {...ICONO}>
      <path d="M21 3L3 10l7 3 3 7z" />
    </svg>
  );
}
