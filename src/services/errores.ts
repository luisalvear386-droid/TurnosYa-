import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Traduce un error de la base a un mensaje para el usuario.
 * `mensajes` lleva los códigos de PostgreSQL que conoce cada servicio.
 */
export function traducirErrorDeBase(
  error: PostgrestError,
  mensajes: Record<string, string>,
  mensajeGeneral: string,
): string {
  // Sin respuesta del servidor, supabase-js no informa código.
  if (!error.code) {
    return 'No se pudo conectar. Revisá tu conexión a internet.';
  }
  if (mensajes[error.code]) {
    return mensajes[error.code];
  }
  // P0001: "raise exception" de nuestras funciones y triggers, ya escrito para el usuario.
  if (error.code === 'P0001') {
    return error.message;
  }
  return mensajeGeneral;
}
