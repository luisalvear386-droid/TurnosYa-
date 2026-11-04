import type { AuthError } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Resultado } from '@/types/resultado';
import type { Perfil } from '@/types/tablas';

const FALTA_CONFIGURAR = 'Falta configurar Supabase';
const SIN_CONEXION = 'No se pudo conectar. Revisá tu conexión a internet.';
const EMAIL_EN_USO = 'Ya existe una cuenta con ese email.';

const MENSAJES_POR_CODIGO: Record<string, string> = {
  invalid_credentials: 'El email o la contraseña no son correctos.',
  email_not_confirmed: 'Confirmá tu email antes de iniciar sesión.',
  user_already_exists: EMAIL_EN_USO,
  email_exists: EMAIL_EN_USO,
  email_address_invalid: 'Ingresá un email válido.',
  weak_password: 'La contraseña es muy débil. Probá con otra.',
  over_email_send_rate_limit: 'Se enviaron demasiados emails. Probá de nuevo más tarde.',
  over_request_rate_limit: 'Hubo demasiados intentos. Probá de nuevo más tarde.',
  signup_disabled: 'El registro de cuentas no está disponible.',
  email_provider_disabled: 'El registro de cuentas no está disponible.',
};

function traducirError(error: AuthError, mensajeGeneral: string): string {
  // Sin respuesta del servidor, supabase-js informa status 0 o ninguno.
  if (!error.status) {
    return SIN_CONEXION;
  }
  return (error.code && MENSAJES_POR_CODIGO[error.code]) || mensajeGeneral;
}

export async function iniciarSesion(email: string, contrasena: string): Promise<Resultado<true>> {
  if (!supabaseConfigurado) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo iniciar sesión. Probá de nuevo.') };
  }
  return { data: true, error: null };
}

/**
 * Crea la cuenta. El trigger de la base crea el perfil con el nombre de los metadatos.
 * `sesionIniciada` es false si Supabase pide confirmar el email antes de entrar.
 */
export async function registrarse(
  nombre: string,
  email: string,
  contrasena: string,
): Promise<Resultado<{ sesionIniciada: boolean }>> {
  if (!supabaseConfigurado) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: contrasena,
    options: { data: { nombre } },
  });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo crear la cuenta. Probá de nuevo.') };
  }

  // Con la confirmación de email activa, un email repetido no da error: vuelve sin identidades.
  if (data.user?.identities?.length === 0) {
    return { data: null, error: EMAIL_EN_USO };
  }

  return { data: { sesionIniciada: data.session !== null }, error: null };
}

export async function cerrarSesion(): Promise<Resultado<true>> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo cerrar la sesión. Probá de nuevo.') };
  }
  return { data: true, error: null };
}

export async function obtenerPerfil(id: string): Promise<Resultado<Perfil>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre, rol, created_at')
    .eq('id', id)
    .single<Perfil>();

  if (error) {
    return { data: null, error: 'No se pudieron cargar tus datos. Revisá tu conexión a internet.' };
  }
  return { data, error: null };
}

/**
 * Avisa el usuario actual al suscribirse y cada vez que cambia la sesión.
 * Devuelve la función para dejar de escuchar.
 */
export function escucharSesion(alCambiar: (usuarioId: string | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
    // Supabase se puede trabar si se lo consulta dentro de este callback: el aviso va aparte.
    setTimeout(() => alCambiar(sesion?.user.id ?? null), 0);
  });
  return () => data.subscription.unsubscribe();
}
