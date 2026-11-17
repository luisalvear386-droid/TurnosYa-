-- TurnosYa! - DNI en los perfiles
-- Los usuarios se registran e inician sesión con DNI. Supabase Auth necesita un
-- correo, así que la app arma uno interno: <dni>@turnosya.invalid (nunca recibe nada).
-- El dni queda nullable hasta recrear las cuentas viejas; 005 lo hace obligatorio.
-- Referencia: docs/tecnico/modelo-datos.md y docs/producto/reglas-negocio.md

-- ============================================================
-- Columna dni
-- ============================================================

alter table public.profiles
  add column dni text,
  add constraint profiles_dni_formato check (dni ~ '^[0-9]{7,8}$'),
  add constraint profiles_dni_unico unique (dni);

-- ============================================================
-- Trigger: crear el perfil con nombre y dni de los metadatos
-- ============================================================

-- El dni de los metadatos tiene que coincidir con el correo interno: así nadie
-- puede registrarse con el correo de un DNI y guardar otro en su perfil.
create or replace function public.crear_perfil_de_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dni text := new.raw_user_meta_data ->> 'dni';
begin
  if v_dni is null or v_dni !~ '^[0-9]{7,8}$' then
    raise exception 'El DNI tiene que tener 7 u 8 números.';
  end if;

  if split_part(new.email, '@', 1) <> v_dni then
    raise exception 'El DNI no coincide con la cuenta.';
  end if;

  insert into public.profiles (id, nombre, dni)
  values (new.id, new.raw_user_meta_data ->> 'nombre', v_dni);
  return new;
end;
$$;

revoke execute on function public.crear_perfil_de_usuario() from public, anon, authenticated;

-- ============================================================
-- El jugador no puede cambiar su dni
-- ============================================================

-- Ya era así desde 001; se repite para dejarlo explícito: del perfil propio
-- solo se edita el nombre (ni el rol ni el dni).
revoke update on public.profiles from anon, authenticated;
grant update (nombre) on public.profiles to authenticated;

-- ============================================================
-- Verificación: el SQL Editor muestra el resultado de esta consulta
-- ============================================================

select 'columna' as tipo, c.column_name::text as nombre, c.data_type::text as detalle
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'profiles' and c.column_name = 'dni'
union all
select 'restricción', con.conname::text, pg_get_constraintdef(con.oid)
from pg_constraint con
where con.conrelid = 'public.profiles'::regclass
  and con.conname in ('profiles_dni_formato', 'profiles_dni_unico')
union all
select 'trigger', 'crear_perfil_de_usuario guarda el dni',
  case when pg_get_functiondef('public.crear_perfil_de_usuario()'::regprocedure) like '%v_dni%'
    then 'sí' else 'no' end
union all
select 'permiso', 'authenticated puede editar dni',
  case when has_column_privilege('authenticated', 'public.profiles', 'dni', 'UPDATE')
    then 'sí (mal)' else 'no (bien)' end
order by tipo, nombre;
