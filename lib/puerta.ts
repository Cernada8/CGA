// Constantes compartidas de la puerta de entrada (servidor y cliente).

export const CLAVE_PUERTA = "cga:laberinto:superado";
export const EVENTO_PUERTA_ABIERTA = "cga:puerta-abierta";
/** ?entrar=directo: enlace para patrocinadores y academias. Abre la puerta y la recuerda. */
export const PARAMETRO_ENTRAR = "entrar";
/** Si en este tiempo no ha montado la puerta (JS lento o roto), se quita: nunca se bloquea a nadie. */
export const MS_SEGURIDAD = 10_000;

/**
 * Script en línea del <head>. Decide antes del primer pintado:
 * - html.con-puerta: solo en la home, si no se ha superado antes, sin ?entrar=directo y con localStorage usable.
 * - html.anim: estado inicial de la portada (si no hay movimiento reducido). Con puerta, espera a que se abra.
 */
export function scriptInicio(conAnimaciones: boolean): string {
  return `(function(){var d=document.documentElement,g=false;
if(location.pathname==="/"){try{var s=window.localStorage,k=${JSON.stringify(CLAVE_PUERTA)},q=new URLSearchParams(location.search);
if(q.get(${JSON.stringify(PARAMETRO_ENTRAR)})==="directo"){s.setItem(k,"1");q.delete(${JSON.stringify(PARAMETRO_ENTRAR)});var r=q.toString();history.replaceState(null,"",location.pathname+(r?"?"+r:"")+location.hash)}
else if(!s.getItem(k)){g=true}}catch(e){g=false}}
var a=${conAnimaciones ? "!matchMedia(\"(prefers-reduced-motion: reduce)\").matches" : "false"};
if(g){d.classList.add("con-puerta");setTimeout(function(){if(d.dataset.puerta!=="montada"){d.classList.remove("con-puerta","anim")}},${MS_SEGURIDAD})}
if(a){d.classList.add("anim");if(!g){setTimeout(function(){d.classList.remove("anim")},2500)}}})();`.replace(/\n/g, "");
}
