// Fechas del panel: el dueño escribe día y hora de España; en la base se guarda el instante exacto (UTC).

const ZONA = "Europe/Madrid";

function desfaseMadrid(instante: number): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instante));
  const v = (t: string) => Number(partes.find((p) => p.type === t)?.value);
  const comoUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  return comoUtc - instante;
}

/** "2026-10-30" + "20:00" (hora de España) → ISO UTC. Null si no es una fecha válida. */
export function madridAIso(fecha: string, hora: string): string | null {
  const f = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  const h = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!f || !h) return null;
  const [a, m, d, hh, mm] = [f[1], f[2], f[3], h[1], h[2]].map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31 || hh > 23 || mm > 59) return null;
  const base = Date.UTC(a, m - 1, d, hh, mm);
  // Dos pasadas: el desfase depende del propio instante (cambio de hora)
  let instante = base - desfaseMadrid(base);
  instante = base - desfaseMadrid(instante);
  const comprobacion = new Date(instante);
  if (Number.isNaN(comprobacion.getTime())) return null;
  return comprobacion.toISOString();
}

/** ISO → { fecha: "2026-10-30", hora: "20:00" } en hora de España (para rellenar el formulario). */
export function isoAMadrid(iso: string | null): { fecha: string; hora: string } {
  if (!iso) return { fecha: "", hora: "20:00" };
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso));
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  return { fecha: `${v("year")}-${v("month")}-${v("day")}`, hora: `${v("hour")}:${v("minute")}` };
}

/** «viernes, 30 de octubre de 2026, 20:00» */
export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeStyle: "short", timeZone: ZONA }).format(new Date(iso));
}

/** «hace 5 min», «hace 2 h», «25 oct, 21:10» */
export function haceCuanto(iso: string, ahora = Date.now()): string {
  const s = Math.round((ahora - new Date(iso).getTime()) / 1000);
  if (s < 60) return "ahora mismo";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86_400) return `hace ${Math.floor(s / 3600)} h`;
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: ZONA }).format(new Date(iso));
}
