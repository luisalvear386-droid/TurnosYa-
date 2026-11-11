import type { PostgrestError } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '@/lib/supabase';
import { traducirErrorDeBase } from '@/services/errores';
import type { Resultado } from '@/types/resultado';
import type { ReservaConCancha, TurnoOcupado } from '@/types/tablas';

const MENSAJES_POR_CODIGO: Record<string, string> = {
  // Índice único: ya hay una reserva confirmada en esa cancha, fecha y hora.
  '23505': 'Ese turno se acaba de ocupar. Elegí otro.',
  // RLS.
  '42501': 'No tenés permiso para hacer esto.',
};

function traducirError(error: PostgrestError, mensajeGeneral: string): string {
  return traducirErrorDeBase(error, MENSAJES_POR_CODIGO, mensajeGeneral);
}

/** Turnos confirmados entre dos fechas, de todos, sin datos personales. */
export async function obtenerTurnosOcupados(
  desde: string,
  hasta: string,
): Promise<Resultado<TurnoOcupado[]>> {
  if (!supabaseConfigurado) {
    return { data: null, error: 'Falta configurar Supabase' };
  }

  const { data, error } = await supabase.rpc('turnos_ocupados', { desde, hasta });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudieron cargar los turnos. Probá de nuevo.') };
  }
  // Sin tipos generados de la base, rpc no conoce las columnas que devuelve la función.
  return { data: data as TurnoOcupado[], error: null };
}

/** Datos de un turno: `hora_inicio` en formato "HH:00:00". */
export type DatosTurno = { cancha_id: string; fecha: string; hora_inicio: string };

/** Reserva del jugador a su nombre. La base valida horario, cancha y ventana. */
export async function crearReserva(turno: DatosTurno, jugadorId: string): Promise<Resultado<true>> {
  const { error } = await supabase.from('reservas').insert({ ...turno, jugador_id: jugadorId });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo hacer la reserva. Probá de nuevo.') };
  }
  return { data: true, error: null };
}

const COLUMNAS_CON_CANCHA =
  'id, cancha_id, jugador_id, nombre_cliente, fecha, hora_inicio, estado, creada_por, created_at, cancha:canchas(nombre)';

/** Reservas del jugador, de la más nueva a la más vieja. */
export async function obtenerMisReservas(jugadorId: string): Promise<Resultado<ReservaConCancha[]>> {
  if (!supabaseConfigurado) {
    return { data: null, error: 'Falta configurar Supabase' };
  }

  const { data, error } = await supabase
    .from('reservas')
    .select(COLUMNAS_CON_CANCHA)
    .eq('jugador_id', jugadorId)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false })
    .returns<ReservaConCancha[]>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudieron cargar tus reservas. Probá de nuevo.') };
  }
  return { data, error: null };
}

/**
 * Cancela una reserva confirmada. La base decide quién puede:
 * el jugador, las suyas y hasta 2 horas antes; el admin, cualquiera.
 */
export async function cancelarReserva(id: string): Promise<Resultado<true>> {
  const { error } = await supabase.rpc('cancelar_reserva', { id });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo cancelar la reserva. Probá de nuevo.') };
  }
  return { data: true, error: null };
}
