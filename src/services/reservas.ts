import type { PostgrestError } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '@/lib/supabase';
import { traducirErrorDeBase } from '@/services/errores';
import type { Resultado } from '@/types/resultado';
import type { TurnoOcupado } from '@/types/tablas';

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
