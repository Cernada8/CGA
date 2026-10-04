# CLAUDE.md: web de CGA Training Hard

Web escaparate de **CGA Training Hard**, marca española de ropa de jiu-jitsu (BJJ) y streetwear. **No es una tienda**: vende la mentalidad (Constancia, Ganas y Actitud) y su objetivo es que el visitante **siga @cga.training.hard en Instagram**.

> **La skill `cga-marca` manda** en todo lo de marca: hechos, tono, colores, tipografía, fotos, temas por drop y lo que nunca se dice. Cárgala antes de escribir textos o tocar la parte visual. Si este archivo y `cga-marca` chocan en algo de marca, gana `cga-marca`; en lo técnico, gana este archivo. Ninguna otra guía de marca aplica, tampoco `brand-guidelines`.

## Reglas que no se negocian

- Todo el contenido visible está en **español de España** (tuteo y vosotros). El código, los nombres de variables y los commits van en inglés; los comentarios, en español.
- **Nunca** se muestran unidades por edición ni stock. Nada de lenguaje de tienda: carrito, comprar, oferta.
- **No se inventan datos.** Si falta un precio, una fecha, una talla o el año de fundación, pon un marcador visible (`[PRECIO]`, `[FECHA DROP]`) y avísame.
- No hay sección de embajadores. Patch4Gi tiene como mucho una mención discreta en el pie.
- **Móvil primero, rendimiento, SEO y accesibilidad** son requisitos, no extras. Si una idea visual los rompe, se cambia la idea.
- No se instalan dependencias nuevas sin decirme cuál, para qué y cuánto pesa.

## Stack

- **Next.js** (16.3 o superior), App Router y TypeScript en modo `strict`. Server Components por defecto; `"use client"` solo donde haya interacción.
- **Tailwind CSS v4**, con los tokens de marca en `@theme` y variables CSS.
- **GSAP** con `@gsap/react` (`useGSAP`) para animación. Nada de Framer Motion: una sola librería de animación.
- **Supabase** con `@supabase/ssr` para los datos de drops y prendas. Hoy solo hay lectura pública.
- **Vercel** para el despliegue. Imágenes con `next/image` (AVIF/WebP), fuentes con `next/font`.
- **Pruebas:** Playwright, más `@axe-core/playwright` para accesibilidad.

## Comandos

```bash
npm run dev        # servidor local
npm run build      # build de producción (debe pasar antes de cualquier PR)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test:e2e   # Playwright + axe
```

Si el gestor de paquetes no es npm, cambia estos comandos y no mezcles lockfiles.

## Estructura

```
app/
  layout.tsx            # fuentes, metadatos base, tema del drop activo (data-drop)
  page.tsx              # home: todas las secciones, renderizadas en servidor
  colaboraciones/       # página directa para academias y marcas (sin laberinto)
  opengraph-image.tsx   # OG dinámica con el acento del drop activo
  sitemap.ts, robots.ts
components/
  laberinto/            # SOLO cliente, carga diferida
  secciones/            # Manifiesto, Historia, DropActual, CuentaAtras, Archivo, ComoConseguirlo, Colaboraciones, Pie
  ui/
lib/
  supabase/             # clientes server/browser
  drops.ts              # consultas y tipos
  tema.ts               # tipo TemaDrop y utilidades de contraste
supabase/migrations/
tests/e2e/
```

## Qué skill usar en cada momento

| Tarea | Skill o herramienta |
|---|---|
| Textos, tono, colores, tipografía, fotos, temas | `cga-marca` (siempre primero) |
| Dirección de arte, layout, componentes nuevos | `frontend-design` con `cga-marca` |
| Microcopy (botones, estados vacíos, errores) | `design:ux-copy` con `cga-marca` |
| Crítica de una pantalla o captura | `design:design-critique` |
| Tokens y sistema de temas | `design:design-system` |
| Animaciones, laberinto, revelado C-G-A | `gsap-skills` (gsap-react, gsap-timeline, gsap-performance) |
| Componentes React/Next y carga de datos | `vercel-react-best-practices` |
| Esquema, migraciones y RLS | `supabase` + `supabase-postgres-best-practices` |
| SEO, Open Graph, Core Web Vitals | `web-quality-skills` |
| Accesibilidad | `design:accessibility-review` + tests con `@axe-core/playwright` |
| Verificación visual y de flujos | Playwright (capturas a 390 px y 1440 px) |
| Despliegue y logs | conector Vercel |

No uses `modern-web-designer`, `web-artifacts-builder` ni `brand-guidelines` en este proyecto: empujan hacia estéticas genéricas o hacia artefactos que no son este repo.

## El laberinto de entrada

Es el elemento estrella y el más delicado. Requisitos técnicos:

- **El contenido va primero.** Toda la home se renderiza en servidor y existe en el HTML. El laberinto es una capa superpuesta que monta el cliente con `next/dynamic` (`ssr: false`). No bloquea el LCP y no oculta nada a Google.
- **Mientras la capa está abierta**, el `<main>` lleva `inert` para que el foco no se escape. Al cerrarse se quita `inert` y el foco pasa al primer encabezado.
- **Se muestra solo la primera vez.** Usa `localStorage` con la clave `cga:laberinto:superado`, envuelto en `try/catch`. Si el almacenamiento falla, el laberinto no se muestra: mejor perder la sorpresa que bloquear a alguien.
- **Hay dos formas de saltarlo:**
  - el botón «Entrar directo», visible desde el primer frame y accesible por teclado;
  - el parámetro `?entrar=directo`, que también guarda la marca de superado. Además, la ruta `/colaboraciones` nunca muestra laberinto.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` no hay laberinto; se muestra una entrada estática con C-G-A.
- **Implementación:** Canvas 2D (o SVG) con generación determinista por semilla. Nada de Three.js ni WebGL. Duración objetivo de unos 30 s, cuadrícula pequeña en móvil y ayuda sutil (marcar el camino) si alguien tarda más de unos 45 s.
- **Controles:** flechas y WASD; en táctil, deslizar y una cruceta en pantalla con objetivos de al menos 44 px.
- **Revelado final:** Constancia, Ganas y Actitud, una palabra cada vez, con una timeline de GSAP de menos de 2,5 s en total. Después se desmonta el componente y se liberan los listeners.
- **Peso:** el chunk del laberinto con GSAP no entra en el JS inicial. Objetivo: menos de 60 KB gzip.

## Modelo de datos (Supabase)

El modelo queda preparado para una tienda futura sin rehacer nada, pero hoy solo se expone lo que se ve.

- **`drops`:** id, slug, estado (`proximo` | `activo` | `agotado`), fecha_lanzamiento (nullable), tema (jsonb: acento, textoSobreAcento, fondoCampana), publicado, created_at. Un drop es solo la agrupación interna de un lanzamiento: **en la web no se numeran ni se nombran**; se habla de «Lo nuevo», «Lo próximo» y «Ya no hay».
- **`productos`:** id, drop_id, slug, nombre, categoria, descripcion, gramaje_g (nullable), linea (`general` | `woman` | `kids`), orden, publicado.
- **`variantes`:** id, producto_id, talla, color, sku (nullable), precio_cents (nullable), stock (nullable; **nunca se lee desde el cliente**).
- **`imagenes_producto`:** id, producto_id, ruta_storage, alt (en español, obligatorio), orden, tipo (`producto` | `campana`).
- **`suscriptores_drop`** (para cuando haya avisos): id, email, consentimiento_at, origen. Solo se escribe desde el servidor.

Reglas de acceso:

- **RLS activada en todas las tablas.** El rol `anon` solo lee filas con `publicado = true`, y nunca las columnas `stock` ni `sku`: usa una vista pública o selecciona columnas explícitas.
- Las escrituras se hacen solo con la clave de servicio, en el servidor, y la clave de servicio nunca va al cliente.
- Trabaja contra un **proyecto o rama de desarrollo**. Antes de aplicar una migración, enséñamela.

## Temas por drop

El tema activo se resuelve en el servidor (en `layout.tsx`) y se aplica con `data-drop` en `<html>`. Las variables `--cga-acento`, `--cga-texto-sobre-acento` y `--cga-fondo-campana` cambian por drop; los componentes nunca usan colores sueltos, solo tokens. Al añadir un drop, comprueba en `lib/tema.ts` que el acento tiene al menos 4,5:1 sobre el negro de base y reporta el valor.

## Cuenta atrás e Instagram

- **Cuenta atrás:** la fecha viene de `drops.fecha_lanzamiento`. El servidor pinta un estado neutro y el cliente calcula el tiempo, para que no haya error de hidratación. Si no hay fecha, se muestra el texto de «muy pronto» de `cga-marca`.
- **Instagram:** no hay feed embebido ni API de Meta. Se usan fotos seleccionadas a mano y enlaces directos al perfil. El CTA de Instagram es la acción más visible de cada pantalla.

## SEO y metadatos

- **Metadatos:** `metadata` en cada ruta, `lang="es-ES"`, título y descripción propios, y canonical.
- **Open Graph y Twitter Card:** imagen dinámica con `opengraph-image.tsx`, con el acento del drop activo.
- **Datos estructurados:** JSON-LD de tipo `Organization` (con `sameAs` a Instagram) y, por prenda, `Product` **sin** `offers` mientras no haya venta online.
- `sitemap.ts` y `robots.ts`. Un solo `h1` por página y jerarquía de encabezados correcta.

## Calidad mínima antes de dar algo por terminado

- `build`, `lint`, `typecheck` y `test:e2e` en verde.
- **Presupuestos en móvil (4G simulado):**
  - LCP por debajo de 2,5 s, CLS por debajo de 0,1 e INP por debajo de 200 ms;
  - JS inicial por debajo de 150 KB gzip, sin contar el laberinto.
- Accesibilidad: cero violaciones serias o críticas de axe; navegación completa por teclado; foco visible; `alt` en español en todas las imágenes; animaciones con alternativa para `prefers-reduced-motion`.
- Capturas con Playwright a 390 px y 1440 px de cada sección tocada, revisadas con `design:design-critique`.
- La lista de revisión del final de `cga-marca` está pasada.

## Forma de trabajar

- Cambios pequeños y revisables. Explica el plan en 3–5 líneas antes de tocar varios archivos.
- Si una decisión de diseño o de marca no está cubierta aquí ni en `cga-marca`, propón 2 opciones con su coste y pregúntame. No improvises.
- Sé crítico: si algo que pido perjudica al rendimiento, al SEO o al objetivo de «seguir en Instagram», dilo antes de hacerlo.
