"use client";

import Image from "next/image";
import { useRef } from "react";

// Portada del vídeo de la historia de CGA + reproductor en una ventana modal (<dialog> nativo:
// foco atrapado, Esc para cerrar). El vídeo no descarga nada hasta que se pulsa (preload="none").
const DURACION = "1:47";

export function VideoHistoria() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  function abrir() {
    dialogo.current?.showModal();
    document.documentElement.classList.add("sin-scroll");
    void video.current?.play().catch(() => {});
  }

  function cerrar() {
    dialogo.current?.close();
  }

  function alCerrar() {
    video.current?.pause();
    document.documentElement.classList.remove("sin-scroll");
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-haspopup="dialog"
        className="video-portada group relative mx-auto block w-full max-w-[900px] overflow-hidden text-left"
      >
        <span className="relative block aspect-[4/5] sm:aspect-[16/10] lg:aspect-video">
          {/* Relleno lateral: la misma foto, muy difuminada, para que la foto vertical no deje huecos */}
          <Image
            src="/video/historia-portada.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="video-portada__relleno object-cover"
          />
          <span className="video-portada__marco absolute inset-0 sm:inset-y-0 sm:right-auto sm:left-1/2 sm:aspect-[926/1232] sm:-translate-x-1/2">
            <Image
              src="/video/historia-portada.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 360px, 100vw"
              className="video-portada__foto object-cover"
            />
          </span>
        </span>
        <span aria-hidden="true" className="video-portada__velo" />
        <span className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-5 sm:gap-6 sm:p-8 lg:p-10">
          <span aria-hidden="true" className="video-portada__play">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
          <span className="block">
            <span className="block font-grito text-[clamp(1.9rem,5vw,3.75rem)] leading-[0.95]">Caes. Te levantas. Sigues.</span>
            <span className="mt-2 block text-base text-blanco/85">
              Mira la historia de CGA <span className="text-gris">({DURACION})</span>
            </span>
          </span>
        </span>
      </button>

      <dialog
        ref={dialogo}
        onClose={alCerrar}
        onClick={(e) => e.target === e.currentTarget && cerrar()}
        aria-label="Vídeo: la historia de CGA"
        className="video-modal"
      >
        <div className="relative mx-auto w-[min(92vw,1100px)]">
          <button
            type="button"
            onClick={cerrar}
            className="absolute -top-14 right-0 inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-blanco hover:text-acento"
          >
            Cerrar
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <video
            ref={video}
            src="/video/historia-cga.mp4"
            controls
            playsInline
            preload="none"
            className="aspect-video w-full bg-negro"
          />
        </div>
      </dialog>
    </>
  );
}
