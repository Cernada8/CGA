-- Contador de visitas propio, sin cookies ni terceros.
-- Privacidad: no se guarda ni la IP ni el navegador. Solo un identificador anónimo que cambia cada día
-- (huella de IP + navegador + fecha + un secreto del servidor, recortada a 16 caracteres): sirve para contar
-- visitantes únicos de un día, pero no permite saber quién es nadie ni seguirle de un día a otro.
-- Acceso: la web pública solo puede AÑADIR filas (nunca leerlas); leer, solo un admin con doble factor.

create table public.visitas (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  ruta text not null check (ruta ~ '^/[a-z0-9/_-]*$' and char_length(ruta) <= 200),
  visitante text not null check (visitante ~ '^[0-9a-f]{16}$'),
  pais text check (pais ~ '^[A-Z]{2}$'),
  dispositivo text not null check (dispositivo in ('movil', 'tableta', 'ordenador')),
  origen text check (origen ~ '^[a-z0-9.-]{1,100}$')
);
alter table public.visitas enable row level security;
create index visitas_creado_idx on public.visitas (creado desc);

-- La web (rol anon, desde el servidor) solo inserta, y solo estas columnas (la fecha la pone la base de datos)
revoke all on public.visitas from anon, authenticated;
grant insert (ruta, visitante, pais, dispositivo, origen) on public.visitas to anon;
create policy "visitas: la web solo apunta" on public.visitas
  for insert to anon
  with check (true);

-- Leer: solo admins con doble factor (es_admin ya comprueba lista + aal2)
grant select on public.visitas to authenticated;
create policy "visitas: solo admins leen" on public.visitas
  for select to authenticated
  using ((select public.es_admin()));

-- Resumen para el panel, ya agregado en la base de datos (rápido aunque haya muchas filas).
-- security invoker: se ejecuta con los permisos de quien llama, así que RLS manda (un no admin recibe ceros).
-- Días contados en hora de Madrid.
create function public.resumen_visitas(p_dias integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with rango as (
    select greatest(1, least(coalesce(p_dias, 30), 365)) as dias
  ),
  base as (
    select
      v.*,
      (v.creado at time zone 'Europe/Madrid')::date as dia
    from public.visitas v, rango
    where v.creado >= ((now() at time zone 'Europe/Madrid')::date - (rango.dias - 1)) at time zone 'Europe/Madrid'
  ),
  dias as (
    select generate_series(
      (now() at time zone 'Europe/Madrid')::date - ((select dias from rango) - 1),
      (now() at time zone 'Europe/Madrid')::date,
      interval '1 day'
    )::date as dia
  ),
  por_dia as (
    select d.dia, count(b.id) as visitas, count(distinct b.visitante) as visitantes
    from dias d left join base b on b.dia = d.dia
    group by d.dia
  )
  select jsonb_build_object(
    'dias', (select dias from rango),
    'visitas', (select count(*) from base),
    'visitantes', (select count(distinct (dia, visitante)) from base),
    'hoy', (select coalesce(visitas, 0) from por_dia where dia = (now() at time zone 'Europe/Madrid')::date),
    'visitantes_hoy', (select coalesce(visitantes, 0) from por_dia where dia = (now() at time zone 'Europe/Madrid')::date),
    'por_dia', (select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'visitas', visitas, 'visitantes', visitantes) order by dia), '[]'::jsonb) from por_dia),
    'paginas', (select coalesce(jsonb_agg(jsonb_build_object('clave', ruta, 'total', n) order by n desc), '[]'::jsonb)
                from (select ruta, count(*) as n from base group by ruta order by n desc limit 8) t),
    'paises', (select coalesce(jsonb_agg(jsonb_build_object('clave', pais, 'total', n) order by n desc), '[]'::jsonb)
               from (select coalesce(pais, '??') as pais, count(distinct (dia, visitante)) as n from base group by 1 order by n desc limit 8) t),
    'dispositivos', (select coalesce(jsonb_agg(jsonb_build_object('clave', dispositivo, 'total', n) order by n desc), '[]'::jsonb)
                     from (select dispositivo, count(distinct (dia, visitante)) as n from base group by 1) t),
    'origenes', (select coalesce(jsonb_agg(jsonb_build_object('clave', origen, 'total', n) order by n desc), '[]'::jsonb)
                 from (select coalesce(origen, 'directo') as origen, count(distinct (dia, visitante)) as n from base group by 1 order by n desc limit 8) t)
  );
$$;
revoke execute on function public.resumen_visitas(integer) from public, anon;
grant execute on function public.resumen_visitas(integer) to authenticated;
