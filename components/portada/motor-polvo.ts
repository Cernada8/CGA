// Polvo de tatami: fondo vivo de la portada. WebGL 1 a pelo, sin librerías.
// Una nube (fbm animado) del color del acento del drop que solo se ve donde hay «polvo»:
// - lámpara de lava: 6 manchas que vagan solas y sin parar por toda la portada, se cruzan y se funden.
//   Se calculan EN EL SOMBREADOR (campo de gaussianas con sus posiciones como uniforms): ni canvas 2D
//   ni subir texturas en cada fotograma, que es lo que más cuesta en un móvil;
// - la estela del ratón o del dedo y la barrida en S de la entrada: van en una máscara 2D pequeña que
//   solo se sube a la GPU mientras hay estela viva; cuando se ha evaporado, se deja de tocar.
// Optimización: resolución reducida (la nube es blanda y el navegador la escala), salida temprana en los
// píxeles sin polvo, bucle parado si la portada no se ve o la pestaña está oculta.

const VERTICE = `attribute vec2 aPos;varying vec2 vUv;
void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;

const MANCHAS = 6;

// highp si existe: el hash con sin()*43758 se rompe en mediump (16 bits en muchos móviles)
const fragmento = (octavas: number) => `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uMask;uniform vec3 uTinte;uniform float uTiempo,uLado,uMax,uConMascara,uAspecto;
uniform vec4 uManchas[${MANCHAS}];varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<${octavas};i++){v+=a*noise(p);p=p*2.03+17.1;a*=.5;}return v;}
void main(){
  // Lava: suma de gaussianas (se funden de forma natural, como la cera)
  float campo=0.;
  for(int i=0;i<${MANCHAS};i++){
    vec2 d=(vUv-uManchas[i].xy)*vec2(uAspecto,1.);
    campo+=uManchas[i].w*exp(-dot(d,d)/(uManchas[i].z*uManchas[i].z));
  }
  float m=smoothstep(.12,1.,campo);
  if(uConMascara>.5)m=max(m,texture2D(uMask,vUv).a);
  if(m<.004){gl_FragColor=vec4(0.);return;}
  vec2 p=gl_FragCoord.xy/uLado*3.;float t=uTiempo*.24;
  vec2 w=vec2(fbm(p+vec2(t,-t*.6)),fbm(p+vec2(5.2,1.3)-t));
  float n=fbm(p*1.2+w*2.5+vec2(0.,t)),n2=fbm(p*2.6+w*3.-t*.5);
  vec3 oscuro=uTinte*.18,claro=mix(uTinte,vec3(.97,.96,.93),.6);
  vec3 col=mix(oscuro,uTinte*1.05,smoothstep(.3,.62,n));
  col=mix(col,claro,smoothstep(.52,.8,n2)*.95);
  col+=pow(1.-abs(n2*2.-1.),8.)*.35*uTinte;
  float a=clamp(smoothstep(.25,.62,n)*.92+.08,0.,1.);
  // Borde deshilachado con el propio ruido (sin otra llamada a fbm)
  m=smoothstep(.06,.6,m+(w.x-.5)*.6*smoothstep(0.,.3,m));
  a*=m*uMax;
  gl_FragColor=vec4(col*a,a);}`;

/** Estela del puntero y barrida de entrada (valores del original) */
const ESTELA = { radio: 0.2, desvanecer: 0.022, duracionBarrida: 1.6, retrasoBarrida: 500, vida: 3200 };

type Opciones = { esperarA?: string };

export function iniciarPolvo(canvas: HTMLCanvasElement, seccion: HTMLElement, { esperarA }: Opciones): () => void {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return () => {};
  // Sin aceleración por hardware (WebGL emulado en la CPU) el humo bloquearía la página: mejor el negro con grano
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const tarjeta = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(tarjeta)) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return () => {};
  }

  // Estado del bucle (arriba: los oyentes y la barrida pueden llamar a activar() durante el arranque)
  let visible = true, raf = 0, antes = 0, primerFotograma = true;
  // Con la puerta del laberinto cerrada no se pinta nada: el juego se queda con toda la potencia
  let puertaAbierta = !(esperarA && document.documentElement.classList.contains("con-puerta"));
  const esMovil = () => innerWidth < 1024;

  // ---------- Programa (menos octavas en móvil: casi igual a la vista, bastante menos trabajo) ----------
  const sombreador = (tipo: number, fuente: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, fuente);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sombreador(gl.VERTEX_SHADER, VERTICE));
  gl.attachShader(prog, sombreador(gl.FRAGMENT_SHADER, fragmento(esMovil() ? 4 : 5)));
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "programa");
  gl.useProgram(prog);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uTiempo = u("uTiempo"), uLado = u("uLado"), uTinte = u("uTinte"), uMax = u("uMax");
  const uConMascara = u("uConMascara"), uAspecto = u("uAspecto"), uManchas = u("uManchas");
  gl.uniform1i(u("uMask"), 0);

  // Tinte: el acento del drop activo (cambia solo con el tema)
  const acento = getComputedStyle(document.documentElement).getPropertyValue("--cga-acento").trim() || "#a39c84";
  const rgb = /^#?([0-9a-f]{6})$/i.exec(acento)?.[1] ?? "a39c84";
  gl.uniform3f(uTinte, ...([0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16) / 255) as [number, number, number]));

  // ---------- Máscara de la estela (canvas 2D a 1/3; solo se sube mientras hay estela) ----------
  const mascara = document.createElement("canvas");
  const mctx = mascara.getContext("2d")!;
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  let estelaHasta = 0; // hasta cuándo queda estela por evaporar
  let mascaraSucia = false;

  let movil = false;
  // Calidad adaptativa: si el dispositivo no llega a ~50 fps, se baja la resolución de la nube (hasta la mitad).
  // La nube es blanda: a menos resolución casi no cambia, y la animación se mantiene fluida.
  let calidad = 1;
  let medidos = 0, tiempoMedido = 0;
  function medir() {
    const r = seccion.getBoundingClientRect();
    movil = esMovil();
    // Nube blanda: con media resolución (o menos) no se nota y el móvil trabaja 4 veces menos
    const escala = Math.min(devicePixelRatio, 1.5) * (movil ? 0.42 : 0.6) * calidad;
    canvas.width = Math.max(1, Math.round(r.width * escala));
    canvas.height = Math.max(1, Math.round(r.height * escala));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform1f(uLado, Math.min(canvas.width, canvas.height) * (movil ? 1.1 : 0.9));
    gl!.uniform1f(uAspecto, r.width / Math.max(1, r.height));
    gl!.uniform1f(uMax, movil ? 0.9 : 0.95);
    mascara.width = Math.max(1, Math.round(r.width / 3));
    mascara.height = Math.max(1, Math.round(r.height / 3));
    mascaraSucia = true;
    activar();
  }

  // ---------- Lámpara de lava ----------
  // Cada mancha sigue una suma de dos senos por eje, con frecuencias y fases al azar (distintas en cada
  // visita): el camino es continuo y suave (sin saltos ni cambios bruscos de velocidad) y no se repite.
  // El tamaño y la densidad también respiran. En móvil recorren toda la pantalla; en escritorio, cargadas
  // hacia el luchador.
  const azar = (min: number, max: number) => min + Math.random() * (max - min);
  const manchas = Array.from({ length: MANCHAS }, (_, i) => ({
    cx: azar(0.25, 0.75), sesgo: i < 3 ? 0.18 : 0,
    ax: azar(0.2, 0.32), fx: azar(0.13, 0.26), px: azar(0, 6.3),
    bx: azar(0.06, 0.12), gx: azar(0.33, 0.52),
    ay: azar(0.28, 0.4), fy: azar(0.09, 0.19), py: azar(0, 6.3),
    by: azar(0.05, 0.1), gy: azar(0.29, 0.47),
    r: azar(0.16, 0.24), fr: azar(0.2, 0.45), pr: azar(0, 6.3),
    k: azar(0.75, 1.05), fk: azar(0.15, 0.3),
  }));
  const datosManchas = new Float32Array(MANCHAS * 4);
  function lava(t: number) {
    manchas.forEach((m, i) => {
      const cx = movil ? m.cx : Math.min(0.88, m.cx + m.sesgo);
      datosManchas[i * 4] = cx + m.ax * Math.sin(t * m.fx + m.px) + m.bx * Math.sin(t * m.gx + m.px * 1.7);
      datosManchas[i * 4 + 1] = 0.5 + m.ay * Math.sin(t * m.fy + m.py) + m.by * Math.sin(t * m.gy + m.py * 1.3);
      // Radio en alturas de la portada (en móvil la pantalla es alta: manchas algo más pequeñas)
      datosManchas[i * 4 + 2] = m.r * (movil ? 0.85 : 1.25) * (1 + 0.22 * Math.sin(t * m.fr + m.pr));
      datosManchas[i * 4 + 3] = m.k * (0.8 + 0.2 * Math.sin(t * m.fk + m.px));
    });
    gl!.uniform4fv(uManchas, datosManchas);
  }

  // ---------- Estela: manchas radiales a lo largo del tramo recorrido ----------
  function estampar(a: [number, number], b: [number, number], fuerza = 1) {
    const r = Math.min(mascara.width, mascara.height) * ESTELA.radio * (movil ? 1.3 : 1);
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const pasos = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (r / 4)));
    for (let i = 1; i <= pasos; i++) {
      const t = i / pasos;
      const rr = r * (0.75 + Math.random() * 0.5);
      const x = a[0] + dx * t + (Math.random() - 0.5) * 0.3 * r;
      const y = a[1] + dy * t + (Math.random() - 0.5) * 0.3 * r;
      const g = mctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, `rgba(255,255,255,${0.5 * fuerza})`);
      g.addColorStop(0.6, `rgba(255,255,255,${0.25 * fuerza})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      mctx.fillStyle = g;
      mctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    estelaHasta = performance.now() + ESTELA.vida;
  }

  // ---------- Puntero y dedo (solo se guarda; se dibuja en el bucle) ----------
  let puntero: [number, number] | null = null;
  let ultimo: [number, number] | null = null;
  const alMover = (x: number, y: number) => {
    const r = seccion.getBoundingClientRect();
    if (y < r.top || y > r.bottom) return;
    puntero = [(x - r.left) / 3, (y - r.top) / 3];
  };
  const alPuntero = (e: PointerEvent) => alMover(e.clientX, e.clientY);
  const alTocar = (e: TouchEvent) => e.touches[0] && alMover(e.touches[0].clientX, e.touches[0].clientY);
  const alSoltar = () => {
    puntero = null;
    ultimo = null;
  };
  addEventListener("pointermove", alPuntero, { passive: true });
  addEventListener("touchmove", alTocar, { passive: true });
  addEventListener("touchend", alSoltar, { passive: true });
  document.documentElement.addEventListener("pointerleave", alSoltar);

  // ---------- Barrida de entrada (la S del original, por detrás del luchador) ----------
  let barrida = 0; // 0 → 1
  let barridaDesde = Infinity;
  let pinceladaBarrida: [number, number] | null = null;
  const empezarBarrida = () => {
    puertaAbierta = true;
    barridaDesde = performance.now() + ESTELA.retrasoBarrida;
    activar();
  };
  if (!puertaAbierta && esperarA) addEventListener(esperarA, empezarBarrida, { once: true });
  else empezarBarrida();

  // ---------- Bucle: continuo mientras la portada se ve (la lava no para nunca) ----------
  function activar() {
    if (!raf && visible && puertaAbierta && !document.hidden) {
      antes = performance.now();
      raf = requestAnimationFrame(fotograma);
    }
  }
  function fotograma(ahora: number) {
    raf = 0;
    const transcurrido = Math.min(1, (ahora - antes) / 1000);
    antes = ahora;
    // Cada 60 fotogramas se mira el ritmo real (sin contar pausas largas, p. ej. al cambiar de pestaña)
    if (transcurrido < 0.25) {
      medidos++;
      tiempoMedido += transcurrido;
      if (medidos === 60) {
        if (tiempoMedido / medidos > 1 / 50 && calidad > 0.5) {
          calidad = Math.max(0.5, calidad * 0.75);
          medir();
        }
        medidos = 0;
        tiempoMedido = 0;
      }
    }
    const w = mascara.width, h = mascara.height;

    // Estela: solo se trabaja con la máscara mientras queda algo por evaporar
    const hayBarrida = barrida < 1 && ahora >= barridaDesde;
    if (hayBarrida || puntero || ahora < estelaHasta) {
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = `rgba(0,0,0,${Math.min(1, ESTELA.desvanecer * transcurrido * 60)})`;
      mctx.fillRect(0, 0, w, h);
      mctx.globalCompositeOperation = "source-over";
      if (hayBarrida) {
        barrida = Math.min(1, barrida + Math.min(0.05, transcurrido) / ESTELA.duracionBarrida);
        const y = 0.9 - barrida * 0.8;
        const centro = movil ? 0.5 : 0.7;
        // De abajo arriba: el polvo se levanta del suelo por detrás del luchador
        const destino: [number, number] = [(centro + Math.sin(y * 9.5 + 1.2) * (movil ? 0.22 : 0.13)) * w, y * h];
        if (pinceladaBarrida) estampar(pinceladaBarrida, destino, 0.9);
        pinceladaBarrida = destino;
      }
      if (puntero) {
        if (ultimo && (ultimo[0] !== puntero[0] || ultimo[1] !== puntero[1])) estampar(ultimo, puntero);
        ultimo = puntero;
      }
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.ALPHA, gl!.ALPHA, gl!.UNSIGNED_BYTE, mascara);
      gl!.uniform1f(uConMascara, 1);
      mascaraSucia = true;
    } else if (mascaraSucia) {
      // Evaporada del todo: se limpia una vez y el sombreador deja de leerla
      mctx.clearRect(0, 0, w, h);
      gl!.uniform1f(uConMascara, 0);
      mascaraSucia = false;
    }

    lava(ahora / 1000);
    gl!.uniform1f(uTiempo, ahora / 1000);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    if (primerFotograma) {
      primerFotograma = false;
      canvas.dataset.lista = ""; // aparece con un fundido (CSS): nunca de golpe
    }
    activar();
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) activar();
  });
  io.observe(seccion);
  const ro = new ResizeObserver(medir);
  ro.observe(seccion);
  const alCambiarPestana = () => activar();
  document.addEventListener("visibilitychange", alCambiarPestana);
  const alPerderContexto = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    visible = false;
    delete canvas.dataset.lista;
  };
  canvas.addEventListener("webglcontextlost", alPerderContexto);
  medir();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    removeEventListener("pointermove", alPuntero);
    removeEventListener("touchmove", alTocar);
    removeEventListener("touchend", alSoltar);
    if (esperarA) removeEventListener(esperarA, empezarBarrida);
    document.documentElement.removeEventListener("pointerleave", alSoltar);
    document.removeEventListener("visibilitychange", alCambiarPestana);
    canvas.removeEventListener("webglcontextlost", alPerderContexto);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
