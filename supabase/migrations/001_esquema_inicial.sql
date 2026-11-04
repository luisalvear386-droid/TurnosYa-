-- TurnosYa! - Esquema inicial
-- Tablas, índice de turnos, trigger de perfiles, RLS y funciones.
-- Referencia: docs/tecnico/modelo-datos.md y docs/producto/reglas-negocio.md

-- ============================================================
-- Tablas
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (btrim(nombre) <> ''),
  rol text not null default 'jugador' check (rol in ('jugador', 'admin')),
  created_at timestamptz not null default now()
);

create table public.canchas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (btrim(nombre) <> ''),
  descripcion text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.horarios_atencion (
  id uuid primary key default gen_random_uuid(),
  dia_semana int not null unique check (dia_semana between 0 and 6),
  hora_apertura time not null,
  hora_cierre time not null,
  check (hora_cierre > hora_apertura)
);

create table public.reservas (
  id uuid primary key default gen_random_uuid(),
  cancha_id uuid not null references public.canchas (id),
  jugador_id uuid references public.profiles (id),
  nombre_cliente text,
  fecha date not null,
  -- Los turnos empiezan en hora exacta.
  hora_inicio time not null check (date_trunc('hour', hora_inicio) = hora_inicio),
  estado text not null default 'confirmada'
    check (estado in ('confirmada', 'cancelada_jugador', 'cancelada_admin')),
  creada_por uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  -- Reserva manual: sin jugador, con el nombre del cliente.
  check (jugador_id is not null or btrim(coalesce(nombre_cliente, '')) <> '')
);

-- Nunca dos reservas confirmadas para la misma cancha, fecha y hora.
create unique index reservas_turno_confirmado_idx
  on public.reservas (cancha_id, fecha, hora_inicio)
  where estado = 'confirmada';

-- ============================================================
-- Trigger: crear el perfil al registrarse un usuario en Auth
-- ============================================================

create function public.crear_perfil_de_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre');
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_de_usuario();

revoke execute on function public.crear_perfil_de_usuario() from public, anon, authenticated;

-- ============================================================
-- Consulta de rol para las políticas
-- ============================================================

-- Es security definer para que las políticas de profiles puedan consultar
-- profiles sin entrar en recursión.
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and rol = 'admin'
  );
$$;

revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

-- ============================================================
-- Seguridad (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.canchas enable row level security;
alter table public.horarios_atencion enable row level security;
alter table public.reservas enable row level security;

-- profiles: cada uno lee y edita el suyo, el admin lee todos.
create policy "Leer el perfil propio o todos si es admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));

create policy "Editar el perfil propio"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- RLS filtra filas, no columnas: el rol se protege quitando el permiso.
-- Del perfil propio solo se puede editar el nombre.
revoke update on public.profiles from anon, authenticated;
grant update (nombre) on public.profiles to authenticated;

-- canchas: todos leen, el admin hace todo.
create policy "Leer canchas"
  on public.canchas for select
  to authenticated
  using (true);

create policy "Admin gestiona canchas"
  on public.canchas for all
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- horarios_atencion: todos leen, el admin hace todo.
create policy "Leer horarios de atención"
  on public.horarios_atencion for select
  to authenticated
  using (true);

create policy "Admin gestiona horarios de atención"
  on public.horarios_atencion for all
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- reservas: el jugador lee las suyas y crea a su nombre, el admin hace todo.
-- El jugador no tiene UPDATE: cancela solo con cancelar_reserva().
create policy "Jugador lee sus reservas"
  on public.reservas for select
  to authenticated
  using (jugador_id = (select auth.uid()));

create policy "Jugador crea sus reservas"
  on public.reservas for insert
  to authenticated
  with check (
    jugador_id = (select auth.uid())
    and creada_por = (select auth.uid())
    and estado = 'confirmada'
  );

create policy "Admin gestiona reservas"
  on public.reservas for all
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- ============================================================
-- Funciones (RPC)
-- ============================================================

-- Turnos ocupados para la grilla, sin datos personales.
create function public.turnos_ocupados(desde date, hasta date)
returns table (cancha_id uuid, fecha date, hora_inicio time)
language sql
stable
security definer
set search_path = ''
as $$
  select r.cancha_id, r.fecha, r.hora_inicio
  from public.reservas r
  where r.estado = 'confirmada'
    and r.fecha between desde and hasta;
$$;

revoke execute on function public.turnos_ocupados(date, date) from public, anon;
grant execute on function public.turnos_ocupados(date, date) to authenticated;

-- Cancela una reserva confirmada.
-- Admin: cualquiera, en cualquier momento.
-- Jugador: solo las suyas y hasta 2 horas antes del turno.
create function public.cancelar_reserva(id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reserva public.reservas%rowtype;
  v_es_admin boolean := public.es_admin();
  v_ahora timestamp := now() at time zone 'America/Argentina/Buenos_Aires';
begin
  select r.* into v_reserva
  from public.reservas r
  where r.id = cancelar_reserva.id
  for update;

  -- Mismo mensaje si no existe o es ajena: no se revela si la reserva existe.
  -- "is distinct from" porque las reservas manuales tienen jugador_id null.
  if not found or (not v_es_admin and v_reserva.jugador_id is distinct from auth.uid()) then
    raise exception 'No encontramos esa reserva.';
  end if;

  if v_reserva.estado <> 'confirmada' then
    raise exception 'Esa reserva ya está cancelada.';
  end if;

  if not v_es_admin
    and v_reserva.fecha + v_reserva.hora_inicio - v_ahora < interval '2 hours' then
    raise exception 'Solo podés cancelar hasta 2 horas antes del turno.';
  end if;

  update public.reservas r
  set estado = case when v_es_admin then 'cancelada_admin' else 'cancelada_jugador' end
  where r.id = cancelar_reserva.id;
end;
$$;

revoke execute on function public.cancelar_reserva(uuid) from public, anon;
grant execute on function public.cancelar_reserva(uuid) to authenticated;
