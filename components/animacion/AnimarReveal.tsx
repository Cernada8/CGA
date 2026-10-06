"use client";

import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";

/** Envoltorio cliente para revelar un bloque al entrar en pantalla (una vez). */
export function AnimarReveal({ children, clip, escala, className = "" }: { children: React.ReactNode; clip?: boolean; escala?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, { selector: "[data-anim-revelar]", clip, escala });
  return (
    <div ref={ref} className={`${clip ? "mascara-telon" : ""} ${className}`}>
      {children}
    </div>
  );
}
