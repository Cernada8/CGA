// Política Trusted Types por defecto (CSP: require-trusted-types-for 'script').
// Va en línea al principio del <head>, antes de que cargue ningún script.
// - URLs de script: solo las del propio dominio bajo /_next/ (los trozos de JS de la web).
//   Se devuelve la URL tal cual llega: Turbopack identifica cada trozo por su ruta relativa.
// - HTML inyectado (p. ej. SplitText): se rechaza si trae etiquetas o atributos que ejecuten código.
// - Código como texto (eval, new Function, setTimeout con cadena): siempre bloqueado.
export const POLITICAS_TRUSTED_TYPES = "default nextjs nextjs#bundler";

export const scriptTrustedTypes = `(function(){var t=window.trustedTypes;if(!t||!t.createPolicy)return;try{t.createPolicy("default",{createScriptURL:function(u){var x=new URL(u,location.href);if(x.origin===location.origin&&x.pathname.indexOf("/_next/")===0)return u;throw new TypeError("Script bloqueado")},createHTML:function(h){if(/<\\s*(script|iframe|object|embed|link|meta|base|form|style)\\b|\\son[a-z]+\\s*=|javascript:/i.test(h))throw new TypeError("HTML bloqueado");return h},createScript:function(){throw new TypeError("Codigo dinamico bloqueado")}})}catch(e){}})();`;
