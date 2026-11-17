-- TurnosYa! - DNI obligatorio en los perfiles
-- Correr recién cuando ya no quedan cuentas sin dni (después de recrear las
-- cuentas con DNI). Si queda alguna, el alter falla y no cambia nada.
-- Referencia: docs/tecnico/modelo-datos.md

alter table public.profiles alter column dni set not null;

-- ============================================================
-- Verificación: el SQL Editor muestra el resultado de esta consulta
-- ============================================================

select
  c.column_name as columna,
  c.is_nullable as acepta_vacio,
  (select count(*) from public.profiles) as perfiles,
  (select count(*) from public.profiles where rol = 'admin') as admins
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'profiles' and c.column_name = 'dni';
