-- TurnosYa! - Paso previo a recrear las cuentas con DNI (solo lee, no borra nada)
-- Las cuentas creadas antes de 003 no tienen dni. Muestra cada una y cuántas
-- reservas se van a borrar con 004b (como jugador o cargadas por ella).
-- Correr después de 003 y antes de 004b.

select nombre, rol, como_jugador, cargadas_por_la_cuenta, se_borran
from (
  select
    0 as orden,
    p.nombre,
    p.rol,
    (select count(*) from public.reservas r where r.jugador_id = p.id) as como_jugador,
    (select count(*) from public.reservas r where r.creada_por = p.id) as cargadas_por_la_cuenta,
    (select count(*) from public.reservas r
      where r.jugador_id = p.id or r.creada_por = p.id) as se_borran
  from public.profiles p
  where p.dni is null

  union all

  -- Total sin repetir: una reserva puede contar para dos cuentas.
  select
    1,
    'TOTAL',
    null,
    null,
    null,
    (select count(*) from public.reservas r
      where r.jugador_id in (select id from public.profiles where dni is null)
         or r.creada_por in (select id from public.profiles where dni is null))
) filas
order by orden, nombre;
