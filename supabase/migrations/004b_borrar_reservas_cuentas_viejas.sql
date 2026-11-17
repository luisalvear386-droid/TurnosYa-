-- TurnosYa! - Borra las reservas de las cuentas sin dni (las creadas antes de 003)
-- Sin esto no se pueden borrar esos usuarios en Authentication > Users: reservas
-- apunta a profiles por jugador_id y por creada_por.
-- Correr después de revisar el total de 004a. Es una excepción a "no se borran
-- reservas": son datos de prueba de cuentas que se recrean.

with cuentas_viejas as (
  select id from public.profiles where dni is null
),
borradas as (
  delete from public.reservas r
  where r.jugador_id in (select id from cuentas_viejas)
     or r.creada_por in (select id from cuentas_viejas)
  returning r.id
)

-- Verificación: tiene que coincidir con el TOTAL de 004a.
select
  (select count(*) from borradas) as reservas_borradas,
  (select count(*) from cuentas_viejas) as cuentas_sin_dni;
