export const INSTAGRAM_USUARIO = "cga.training.hard";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USUARIO}/`;
/** Enlace directo al DM de Instagram */
export const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_USUARIO}`;
// Dominio público. En Vercel, si no se define NEXT_PUBLIC_SITE_URL, se usa el dominio de producción.
export const SITIO_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
export const EMAIL_CONTACTO = "cgatraininghard@gmail.com";
