-- TurnosYa! - Reserva manual de prueba (NO es una migración)
-- Sirve para probar la doble reserva con un solo teléfono:
--   1. En el teléfono, como jugador, abrí Reservar en mañana y mirá que el turno de abajo esté "Libre".
--      No deslices para actualizar.
--   2. Ejecutá este archivo en el SQL Editor de Supabase.
--   3. En el teléfono, tocá ese turno y "Reservá": tiene que aparecer
--      "Ese turno se acaba de ocupar. Elegí otro."
--
-- Cambiá solo los valores de "datos". Respeta las validaciones de la 002:
--   - turno futuro (mañana, en hora del complejo),
--   - cancha activa (se busca por nombre),
--   - dentro del horario de atención de ese día (lunes a sábado de 09:00 a 00:00; el domingo está cerrado),
--   - reserva manual: sin jugador y con nombre del cliente. Las manuales no tienen el límite de 7 días.
-- El SQL Editor no tiene usuario de la app (auth.uid() es null): creada_por se completa con el admin.

with datos as (
  select
    'Cancha 2'::text as cancha,
    time '11:00' as hora,
    'Prueba doble reserva'::text as cliente,
    (now() at time zone 'America/Argentina/Buenos_Aires')::date + 1 as fecha
),
nueva as (
  insert into public.reservas (cancha_id, jugador_id, nombre_cliente, fecha, hora_inicio, creada_por)
  select
    c.id,
    null,
    d.cliente,
    d.fecha,
    d.hora,
    (select p.id from public.profiles p where p.rol = 'admin' order by p.created_at limit 1)
  from datos d
  join public.canchas c on c.nombre = d.cancha
  returning id, cancha_id, fecha, hora_inicio, nombre_cliente, estado
)
-- Verificación: una fila = se creó. Ninguna fila = no existe una cancha con ese nombre.
-- Si el turno ya estaba ocupado, Supabase muestra el error del índice único (23505).
-- Si viola una regla de la 002, muestra el mensaje en español del trigger.
select n.id, c.nombre as cancha, n.fecha, n.hora_inicio, n.nombre_cliente, n.estado
from nueva n
join public.canchas c on c.id = n.cancha_id;

-- Para liberar el turno después de la prueba, ejecutá solo esto (seleccionalo y "Run selected"):
-- update public.reservas
-- set estado = 'cancelada_admin'
-- where nombre_cliente = 'Prueba doble reserva' and estado = 'confirmada';
