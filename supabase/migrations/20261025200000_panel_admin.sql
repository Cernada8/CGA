-- Panel de administración de CGA: lanzamientos, prendas, fotos, admins y registro de cambios.
-- Reglas: RLS en todas las tablas; el público solo ve lo publicado y lo ya lanzado (lo próximo,
-- ni el nombre ni las fotos antes de su fecha); escribir solo puede un admin de la lista con
-- doble factor (aal2). Ninguna función SECURITY DEFINER queda expuesta en la API.

create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

-- ---------- Admins (lista cerrada) ----------
create table public.admins (
  email text primary key check (email = lower(email) and email like '%_@_%._%'),
  debe_cambiar_contrasena boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- ---------- ¿Es admin con doble factor? (invoker: sin privilegios extra) ----------
create function public.es_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
    and not coalesce(((select auth.jwt() ->> 'is_anonymous'))::boolean, false)
    and exists (
      select 1 from public.admins a
      where a.email = lower((select auth.jwt() ->> 'email'))
    );
$$;
revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

-- Cada usuario ve (y solo puede marcar) su propia fila: sirve para saber si debe cambiar la contraseña
create policy "admins: ver la propia fila" on public.admins
  for select to authenticated
  using (email = lower((select auth.jwt() ->> 'email')));
create policy "admins: marcar contraseña cambiada" on public.admins
  for update to authenticated
  using (email = lower((select auth.jwt() ->> 'email')))
  with check (email = lower((select auth.jwt() ->> 'email')) and debe_cambiar_contrasena = false);
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;
grant update (debe_cambiar_contrasena) on public.admins to authenticated;

-- ---------- Lanzamientos (en la web no se numeran ni se nombran) ----------
create table public.drops (
  id uuid primary key default gen_random_uuid(),
  nombre_interno text not null check (char_length(btrim(nombre_interno)) between 1 and 80),
  estado text not null check (estado in ('proximo', 'activo', 'agotado')),
  fecha_lanzamiento timestamptz,
  acento text not null default '#a39c84' check (acento ~ '^#[0-9a-f]{6}$'),
  publicado boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proximo_con_fecha check (estado <> 'proximo' or fecha_lanzamiento is not null)
);
alter table public.drops enable row level security;
create index drops_estado_fecha_idx on public.drops (estado, fecha_lanzamiento);

-- ¿Lo ve el público? Publicado y, si es «próximo», solo cuando ya ha llegado su fecha
create function public.drop_lanzado(p_drop uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.drops d
    where d.id = p_drop
      and d.publicado
      and (d.estado <> 'proximo' or d.fecha_lanzamiento <= now())
  );
$$;
revoke execute on function public.drop_lanzado(uuid) from public;
grant execute on function public.drop_lanzado(uuid) to anon, authenticated;

-- La fecha de un lanzamiento publicado sí es pública (alimenta la cuenta atrás)
create policy "drops: público ve lo publicado" on public.drops
  for select to anon, authenticated
  using (publicado);
create policy "drops: admin ve todo" on public.drops
  for select to authenticated using ((select public.es_admin()));
create policy "drops: admin crea" on public.drops
  for insert to authenticated with check ((select public.es_admin()));
create policy "drops: admin edita" on public.drops
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "drops: admin borra" on public.drops
  for delete to authenticated using ((select public.es_admin()));

-- ---------- Prendas ----------
create table public.productos (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid not null references public.drops (id) on delete cascade,
  nombre text check (nombre is null or char_length(btrim(nombre)) between 1 and 80),
  categoria text not null default '' check (char_length(categoria) <= 40),
  descripcion text check (descripcion is null or char_length(descripcion) <= 400),
  gramaje_g integer check (gramaje_g is null or gramaje_g between 50 and 1000),
  linea text not null default 'general' check (linea in ('general', 'woman', 'kids')),
  agotado boolean not null default false,
  publicado boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.productos enable row level security;
create index productos_drop_idx on public.productos (drop_id, orden);

create policy "productos: público ve lo lanzado" on public.productos
  for select to anon, authenticated
  using (publicado and (select public.drop_lanzado(drop_id)));
create policy "productos: admin ve todo" on public.productos
  for select to authenticated using ((select public.es_admin()));
create policy "productos: admin crea" on public.productos
  for insert to authenticated with check ((select public.es_admin()));
create policy "productos: admin edita" on public.productos
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "productos: admin borra" on public.productos
  for delete to authenticated using ((select public.es_admin()));

-- ---------- Fotos ----------
create table public.imagenes_producto (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos (id) on delete cascade,
  ruta_storage text not null unique check (ruta_storage ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'),
  ruta_pequena text not null unique check (ruta_pequena ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-p\.webp$'),
  ancho integer not null check (ancho > 0),
  alto integer not null check (alto > 0),
  alt text not null check (char_length(btrim(alt)) between 3 and 200),
  orden integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.imagenes_producto enable row level security;
create index imagenes_producto_idx on public.imagenes_producto (producto_id, orden);

create policy "imagenes: público ve lo lanzado" on public.imagenes_producto
  for select to anon, authenticated
  using (exists (
    select 1 from public.productos p
    where p.id = producto_id and p.publicado and public.drop_lanzado(p.drop_id)
  ));
create policy "imagenes: admin ve todo" on public.imagenes_producto
  for select to authenticated using ((select public.es_admin()));
create policy "imagenes: admin crea" on public.imagenes_producto
  for insert to authenticated with check ((select public.es_admin()));
create policy "imagenes: admin edita" on public.imagenes_producto
  for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "imagenes: admin borra" on public.imagenes_producto
  for delete to authenticated using ((select public.es_admin()));

-- ---------- Registro de cambios (quién hizo qué y cuándo) ----------
create table public.registro (
  id bigint generated always as identity primary key,
  usuario uuid,
  email text,
  accion text not null,
  tabla text not null,
  fila uuid,
  resumen text,
  creado timestamptz not null default now()
);
alter table public.registro enable row level security;
create index registro_creado_idx on public.registro (creado desc);
create policy "registro: solo admins leen" on public.registro
  for select to authenticated using ((select public.es_admin()));
-- Nadie inserta, edita ni borra desde la API: solo el disparador

create function privado.anotar_cambio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fila_json jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  insert into public.registro (usuario, email, accion, tabla, fila, resumen)
  values (
    auth.uid(),
    auth.jwt() ->> 'email',
    lower(tg_op),
    tg_table_name,
    (fila_json ->> 'id')::uuid,
    left(coalesce(fila_json ->> 'nombre', fila_json ->> 'nombre_interno', fila_json ->> 'alt', ''), 120)
  );
  return null;
end;
$$;
revoke execute on function privado.anotar_cambio() from public, anon, authenticated;

create function privado.tocar_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function privado.tocar_updated_at() from public, anon, authenticated;

create trigger drops_updated before update on public.drops for each row execute function privado.tocar_updated_at();
create trigger productos_updated before update on public.productos for each row execute function privado.tocar_updated_at();
create trigger drops_registro after insert or update or delete on public.drops for each row execute function privado.anotar_cambio();
create trigger productos_registro after insert or update or delete on public.productos for each row execute function privado.anotar_cambio();
create trigger imagenes_registro after insert or update or delete on public.imagenes_producto for each row execute function privado.anotar_cambio();

-- ---------- Permisos de la API (las tablas nuevas no se exponen solas) ----------
revoke all on public.drops, public.productos, public.imagenes_producto, public.registro from anon, authenticated;
grant select on public.drops, public.productos, public.imagenes_producto to anon, authenticated;
grant insert, update, delete on public.drops, public.productos, public.imagenes_producto to authenticated;
grant select on public.registro to authenticated;

-- ---------- Almacén de fotos: privado; solo se sirven las de prendas ya lanzadas ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prendas', 'prendas', false, 6291456, array['image/webp']);

create policy "prendas: público lee fotos lanzadas" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'prendas'
    and exists (
      select 1 from public.imagenes_producto i
      where i.ruta_storage = storage.objects.name or i.ruta_pequena = storage.objects.name
    )
  );
create policy "prendas: admin lee todo" on storage.objects
  for select to authenticated using (bucket_id = 'prendas' and (select public.es_admin()));
create policy "prendas: admin sube" on storage.objects
  for insert to authenticated with check (bucket_id = 'prendas' and (select public.es_admin()));
create policy "prendas: admin reemplaza" on storage.objects
  for update to authenticated using (bucket_id = 'prendas' and (select public.es_admin())) with check (bucket_id = 'prendas' and (select public.es_admin()));
create policy "prendas: admin borra" on storage.objects
  for delete to authenticated using (bucket_id = 'prendas' and (select public.es_admin()));

-- ---------- Datos iniciales ----------
insert into public.admins (email) values ('cgatraininghard@gmail.com'), ('alexcernada2017@gmail.com');

with actual as (
  insert into public.drops (nombre_interno, estado, orden) values ('Colección actual', 'activo', 1) returning id
)
insert into public.productos (drop_id, nombre, categoria, descripcion, gramaje_g, orden)
select actual.id, v.nombre, v.categoria, v.descripcion, v.gramaje, v.orden
from actual, (values
  ('Camiseta oversize', 'Camiseta', 'Algodón. Corte amplio. Hecha para entrenar y para la calle.', 220, 1),
  ('Sudadera oversize', 'Sudadera', 'Pesa lo que tiene que pesar.', 350, 2),
  ('Rashguard', 'Rashguard', 'Para rodar sin pensar en la ropa.', null, 3),
  ('Shorts de grappling', 'Shorts', null, null, 4)
) as v(nombre, categoria, descripcion, gramaje, orden);

insert into public.drops (nombre_interno, estado, fecha_lanzamiento, orden)
values ('Prenda del 30 de octubre', 'proximo', '2026-10-30 20:00:00+01', 2);
