import type { PostgrestError } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Resultado } from '@/types/resultado';
import type { Cancha } from '@/types/tablas';

const FALTA_CONFIGURAR = 'Falta configurar Supabase';
const NO_ENCONTRADA = 'No se encontró la cancha. Puede que ya la hayan eliminado.';
const COLUMNAS = 'id, nombre, descripcion, activa, created_at';

/** Campos que carga el admin en el formulario. */
export type DatosCancha = Pick<Cancha, 'nombre' | 'descripcion' | 'activa'>;

const MENSAJES_POR_CODIGO: Record<string, string> = {
  // Índice único de canchas.nombre.
  '23505': 'Ya existe una cancha con ese nombre.',
  // reservas.cancha_id apunta a la cancha: no se puede borrar.
  '23503': 'La cancha tiene reservas, así que no se puede eliminar. Desactivala para que no aparezca en la grilla.',
  // check (btrim(nombre) <> '').
  '23514': 'Ingresá el nombre de la cancha.',
  // RLS: solo el admin modifica canchas.
  '42501': 'No tenés permiso para modificar canchas.',
};

function traducirError(error: PostgrestError, mensajeGeneral: string): string {
  // Sin respuesta del servidor, supabase-js no informa código.
  if (!error.code) {
    return 'No se pudo conectar. Revisá tu conexión a internet.';
  }
  return MENSAJES_POR_CODIGO[error.code] ?? mensajeGeneral;
}

export async function obtenerCanchas(): Promise<Resultado<Cancha[]>> {
  if (!supabaseConfigurado) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  const { data, error } = await supabase
    .from('canchas')
    .select(COLUMNAS)
    .order('nombre')
    .returns<Cancha[]>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudieron cargar las canchas. Probá de nuevo.') };
  }
  return { data, error: null };
}

export async function obtenerCancha(id: string): Promise<Resultado<Cancha>> {
  const { data, error } = await supabase
    .from('canchas')
    .select(COLUMNAS)
    .eq('id', id)
    .maybeSingle<Cancha>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo cargar la cancha. Probá de nuevo.') };
  }
  if (!data) {
    return { data: null, error: NO_ENCONTRADA };
  }
  return { data, error: null };
}

export async function crearCancha(datos: DatosCancha): Promise<Resultado<Cancha>> {
  const { data, error } = await supabase
    .from('canchas')
    .insert(datos)
    .select(COLUMNAS)
    .single<Cancha>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo crear la cancha. Probá de nuevo.') };
  }
  return { data, error: null };
}

export async function actualizarCancha(id: string, datos: DatosCancha): Promise<Resultado<Cancha>> {
  const { data, error } = await supabase
    .from('canchas')
    .update(datos)
    .eq('id', id)
    .select(COLUMNAS)
    .maybeSingle<Cancha>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo guardar la cancha. Probá de nuevo.') };
  }
  // Sin fila actualizada: la cancha ya no existe o RLS no dejó modificarla.
  if (!data) {
    return { data: null, error: NO_ENCONTRADA };
  }
  return { data, error: null };
}

export async function eliminarCancha(id: string): Promise<Resultado<true>> {
  const { data, error } = await supabase
    .from('canchas')
    .delete()
    .eq('id', id)
    .select('id')
    .returns<Pick<Cancha, 'id'>[]>();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo eliminar la cancha. Probá de nuevo.') };
  }
  if (data.length === 0) {
    return { data: null, error: NO_ENCONTRADA };
  }
  return { data: true, error: null };
}
