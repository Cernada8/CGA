-- Acceso «solo ver» a las visitas para un usuario con nombre y contraseña (sin cuenta de Supabase).
-- El nombre y la contraseña los comprueba la web (servidor). Para leer los datos, la web llama a
-- resumen_visitas_visor con una clave de servidor (VISOR_CLAVE_BD, solo en Vercel): sin esa clave no devuelve
-- nada. Solo lectura del resumen: no hay ninguna función ni permiso para cambiar nada.

-- Ajustes privados (el esquema privado no se publica en la API)
create table if not exists privado.ajustes (
  clave text primary key,
  valor text not null
);
alter table privado.ajustes enable row level security;
revoke all on privado.ajustes from public, anon, authenticated;

-- 1) El cálculo, una sola vez, en privado (security definer: lee la tabla saltándose RLS; no está en la API)
create function privado.calcular_resumen(p_dias integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with rango as (
    select greatest(1, least(coalesce(p_dias, 30), 365)) as dias
  ),
  base as (
    select v.*, (v.creado at time zone 'Europe/Madrid')::date as dia
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
revoke execute on function privado.calcular_resumen(integer) from public, anon, authenticated;

-- 2) Para el visor: solo con la clave de servidor correcta (comparada por su huella SHA-256)
create function public.resumen_visitas_visor(p_clave text, p_dias integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_huella text;
begin
  select valor into v_huella from privado.ajustes where clave = 'visor_clave_bd';
  if v_huella is null or p_clave is null
     or encode(extensions.digest(p_clave, 'sha256'), 'hex') <> v_huella then
    return null;
  end if;
  return privado.calcular_resumen(p_dias);
end;
$$;
revoke execute on function public.resumen_visitas_visor(text, integer) from public, authenticated;
grant execute on function public.resumen_visitas_visor(text, integer) to anon;

-- (La huella de la clave de servidor se guarda aparte, sin escribirla en este archivo:
--  insert into privado.ajustes (clave, valor) values ('visor_clave_bd', '<sha256 de VISOR_CLAVE_BD>');)
