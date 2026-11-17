import type { AuthError } from '@supabase/supabase-js';

import { supabase, supabaseConfigurado } from '@/lib/supabase';
import type { Resultado } from '@/types/resultado';
import type { Perfil } from '@/types/tablas';

const FALTA_CONFIGURAR = 'Falta configurar Supabase';
const SIN_CONEXION = 'No se pudo conectar. Revisá tu conexión a internet.';
const DNI_EN_USO = 'Ya existe una cuenta con ese DNI. Iniciá sesión.';
const DEMASIADOS_INTENTOS = 'Hubo demasiados intentos. Probá de nuevo más tarde.';
const REGISTRO_NO_DISPONIBLE = 'El registro de cuentas no está disponible.';

/**
 * Supabase Auth solo acepta correo o teléfono: cada DNI tiene un correo interno.
 * El dominio .invalid está reservado y nunca recibe nada. El usuario no lo ve nunca:
 * los mensajes de error se traducen por código y no se muestra el texto de Supabase.
 */
const DOMINIO_INTERNO = 'turnosya.invalid';

function correoInterno(dni: string): string {
  return `${dni}@${DOMINIO_INTERNO}`;
}

const MENSAJES_POR_CODIGO: Record<string, string> = {
  invalid_credentials: 'El DNI o la contraseña no son correctos.',
  user_already_exists: DNI_EN_USO,
  email_exists: DNI_EN_USO,
  email_address_invalid: 'Ingresá un DNI válido.',
  weak_password: 'La contraseña es muy débil. Probá con otra.',
  over_email_send_rate_limit: DEMASIADOS_INTENTOS,
  over_request_rate_limit: DEMASIADOS_INTENTOS,
  signup_disabled: REGISTRO_NO_DISPONIBLE,
  email_provider_disabled: REGISTRO_NO_DISPONIBLE,
};

function traducirError(error: AuthError, mensajeGeneral: string): string {
  // Sin respuesta del servidor, supabase-js informa status 0 o ninguno.
  if (!error.status) {
    return SIN_CONEXION;
  }
  return (error.code && MENSAJES_POR_CODIGO[error.code]) || mensajeGeneral;
}

export async function iniciarSesion(dni: string, contrasena: string): Promise<Resultado<true>> {
  if (!supabaseConfigurado) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: correoInterno(dni),
    password: contrasena,
  });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo iniciar sesión. Probá de nuevo.') };
  }
  return { data: true, error: null };
}

/**
 * Crea la cuenta y entra (la confirmación de email está desactivada en Supabase).
 * El trigger de la base crea el perfil con el nombre y el dni de los metadatos.
 */
export async function registrarse(nombre: string, dni: string, contrasena: string): Promise<Resultado<true>> {
  if (!supabaseConfigurado) {
    return { data: null, error: FALTA_CONFIGURAR };
  }

  const { data, error } = await supabase.auth.signUp({
    email: correoInterno(dni),
    password: contrasena,
    options: { data: { nombre, dni } },
  });

  if (error) {
    return { data: null, error: traducirError(error, 'No se pudo crear la cuenta. Probá de nuevo.') };
  }

  // Si alguien activara la confirmación de email, un DNI repetido no daría error: vuelve sin identidades.
  if (data.user?.identities?.length === 0) {
    return { data: null, error: DNI_EN_USO };
  }

  if (!data.session) {
    return { data: null, error: 'Tu cuenta se creó, pero no pudimos entrar. Iniciá sesión con tu DNI.' };
  }

  return { data: true, error: null };
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
    .select('id, nombre, dni, rol, created_at')
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
