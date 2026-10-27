import type { NextConfig } from "next";
import { POLITICAS_TRUSTED_TYPES } from "./lib/seguridad";

const esDev = process.env.NODE_ENV !== "production";

// Política de seguridad de contenido.
// - Todo se sirve desde el propio dominio: sin CDNs, sin scripts de terceros.
// - script-src necesita 'unsafe-inline' porque Next.js mete su carga inicial en <script> en línea
//   y las páginas son estáticas (un nonce obligaría a renderizar cada visita en servidor).
//   El riesgo real es mínimo: la web no recoge ni pinta nada que escriba un visitante.
// - 'unsafe-eval' solo en desarrollo (lo pide el recargado en caliente).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${esDev ? " ws: wss:" : ""}`,
  "manifest-src 'self'",
  "worker-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  // Formularios solo hacia la propia web (el panel envía sus formularios a sí mismo)
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Ningún atributo on*="..." puede ejecutar código (React no los usa)
  "script-src-attr 'none'",
  // Trusted Types: solo se cargan scripts del propio /_next/ y el HTML que se inyecta pasa por una
  // política que bloquea etiquetas y atributos ejecutables (ver lib/seguridad.ts)
  ...(esDev ? [] : ["require-trusted-types-for 'script'", `trusted-types ${POLITICAS_TRUSTED_TYPES}`, "upgrade-insecure-requests"]),
].join("; ");

const cabecerasSeguridad = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=(self)",
      "browsing-topics=()",
      "camera=()",
      "display-capture=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "hid=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=(self)",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "serial=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Aislamiento total de origen: la web solo carga recursos propios, así que se puede exigir.
  // OJO: si algún día se incrusta algo de fuera (vídeo de YouTube, post de Instagram, imágenes de Supabase
  // Storage), ese recurso tiene que mandar Cross-Origin-Resource-Policy o habrá que relajar esta cabecera.
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  // El filtro XSS antiguo de los navegadores causaba más fallos que los que evitaba: se desactiva (OWASP)
  { key: "X-XSS-Protection", value: "0" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // no anunciar qué tecnología hay detrás
  productionBrowserSourceMaps: false, // el código fuente no se publica
  reactStrictMode: true,
  experimental: {
    // Las fotos del panel se suben de una en una: 10 MB por foto y un margen para el resto del formulario
    serverActions: { bodySizeLimit: "11mb" },
  },
  images: {
    // Solo imágenes propias: el optimizador no acepta URLs externas ni SVG.
    remotePatterns: [],
    dangerouslyAllowSVG: false,
    // Solo carpetas de imágenes propias y sin parámetros: nadie puede usar el optimizador para otra cosa
    localPatterns: ["hero", "grafiti", "instagram", "marca", "video"].map((carpeta) => ({ pathname: `/${carpeta}/**`, search: "" })),
    // Una sola calidad y anchos acotados: no se puede reventar la caché pidiendo mil variantes
    qualities: [75],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      { source: "/:path*", headers: cabecerasSeguridad },
      {
        // Las rutas de pruebas nunca deben indexarse aunque alguien las active.
        source: "/dev/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
