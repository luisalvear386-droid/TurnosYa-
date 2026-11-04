import { supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Resultado } from '@/types/resultado';

const FALTA_CONFIGURAR = 'Falta configurar Supabase';

// El servidor respondió que la tabla no existe: hay conexión, falta correr la migración.
const CODIGOS_TABLA_INEXISTENTE = ['PGRST205', '42P01'];

export async function comprobarConexion(): Promise<Resultado<true>> {
  if (!supabaseConfigurado) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  const { error, status } = await supabase.from('profiles').select('id').limit(0);

  if (!error || CODIGOS_TABLA_INEXISTENTE.includes(error.code)) {
    return { data: true, error: null };
  }

  // El servidor rechazó la clave.
  if (status === 401 || status === 403) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  return {
    data: null,
    error: 'No se pudo conectar con Supabase. Revisá tu conexión a internet y la URL del archivo .env.',
  };
}
