import type { PostgrestError } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Resultado } from '@/types/resultado';
import type { HorarioAtencion } from '@/types/tablas';

const MENSAJES_POR_CODIGO: Record<string, string> = {
  // check (hora_cierre > hora_apertura).
  '23514': 'El cierre tiene que ser después de la apertura.',
  // RLS: solo el admin modifica los horarios.
  '42501': 'No tenés permiso para modificar los horarios.',
};

function traducirError(error: PostgrestError, mensajeGeneral: string): string {
  // Sin respuesta del servidor, supabase-js no informa código.
  if (!error.code) {
    return 'No se pudo conectar. Revisá tu conexión a internet.';
  }
  return MENSAJES_POR_CODIGO[error.code] ?? mensajeGeneral;
}

/** Horario de un día abierto. Los días sin fila están cerrados. */
export type DatosHorario = Pick<HorarioAtencion, 'dia_semana' | 'hora_apertura' | 'hora_cierre'>;

export async function obtenerHorarios(): Promise<Resultado<HorarioAtencion[]>> {
  if (!supabaseConfigurado) {
    return { data: null, error: 'Falta configurar Supabase' };
  }

  const { data, error } = await supabase
    .from('horarios_atencion')
    .select('id, dia_semana, hora_apertura, hora_cierre')
    .order('dia_semana')
    .returns<HorarioAtencion[]>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudieron cargar los horarios. Probá de nuevo.') };
  }
  return { data, error: null };
}

/**
 * Guarda la semana completa: crea o actualiza los días abiertos y borra los cerrados.
 * Son dos pasos: si falla el segundo, volver a guardar completa el cambio.
 */
export async function guardarHorarios(
  abiertos: DatosHorario[],
  diasCerrados: number[],
): Promise<Resultado<true>> {
  const mensajeGeneral = 'No se pudieron guardar los horarios. Probá de nuevo.';

  if (abiertos.length > 0) {
    const { error } = await supabase
      .from('horarios_atencion')
      .upsert(abiertos, { onConflict: 'dia_semana' });
    if (error) {
      return { data: null, error: traducirError(error, mensajeGeneral) };
    }
  }

  if (diasCerrados.length > 0) {
    const { error } = await supabase
      .from('horarios_atencion')
      .delete()
      .in('dia_semana', diasCerrados);
    if (error) {
      return { data: null, error: traducirError(error, mensajeGeneral) };
    }
  }

  return { data: true, error: null };
}
