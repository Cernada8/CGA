import type { NextConfig } from "next";

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
  "form-action 'none'",
  "frame-ancestors 'none'",
  ...(esDev ? [] : ["upgrade-insecure-requests"]),
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
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // no anunciar qué tecnología hay detrás
  productionBrowserSourceMaps: false, // el código fuente no se publica
  reactStrictMode: true,
  images: {
    // Solo imágenes propias: el optimizador no acepta URLs externas ni SVG.
    remotePatterns: [],
    dangerouslyAllowSVG: false,
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
