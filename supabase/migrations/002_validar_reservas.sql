-- TurnosYa! - Validaciones de reservas en la base
-- Ninguna reserva confirmada puede quedar en un horario pasado, en una cancha
-- inactiva o fuera del horario de atención. Solo las reservas manuales
-- (sin jugador) pueden cargarse después de la ventana de 7 días.
-- Referencia: docs/producto/reglas-negocio.md

create function public.validar_reserva()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_ahora timestamp := now() at time zone 'America/Argentina/Buenos_Aires';
begin
  -- Cancelar una reserva siempre se puede, aunque el turno ya haya pasado.
  if new.estado <> 'confirmada' then
    return new;
  end if;

  if new.fecha + new.hora_inicio <= v_ahora then
    raise exception 'No podés reservar un horario que ya pasó.';
  end if;

  -- Ventana de la grilla: hoy y los 6 días siguientes.
  if new.jugador_id is not null and new.fecha > v_ahora::date + 6 then
    raise exception 'Solo podés reservar para hoy y los próximos 6 días.';
  end if;

  if not exists (
    select 1
    from public.canchas c
    where c.id = new.cancha_id and c.activa
  ) then
    raise exception 'Esa cancha no está disponible.';
  end if;

  -- El turno dura 1 hora y tiene que terminar antes del cierre. Se compara con
  -- interval porque time da la vuelta a medianoche (23:00 + 1 hora = 00:00).
  if not exists (
    select 1
    from public.horarios_atencion h
    where h.dia_semana = extract(dow from new.fecha)
      and new.hora_inicio >= h.hora_apertura
      and new.hora_inicio::interval + interval '1 hour' <= h.hora_cierre::interval
  ) then
    raise exception 'Ese horario está fuera del horario de atención.';
  end if;

  return new;
end;
$$;

revoke execute on function public.validar_reserva() from public, anon, authenticated;

create trigger al_guardar_reserva
  before insert or update of cancha_id, fecha, hora_inicio, jugador_id, estado
  on public.reservas
  for each row execute function public.validar_reserva();

-- ============================================================
-- Verificación: el SQL Editor muestra el resultado de esta consulta
-- ============================================================

select 'función' as tipo, p.proname::text as nombre
from pg_proc p
where p.pronamespace = 'public'::regnamespace
union all
select 'trigger', t.tgname::text
from pg_trigger t
where not t.tgisinternal
  and t.tgname in ('al_crear_usuario', 'al_guardar_reserva')
order by tipo, nombre;
