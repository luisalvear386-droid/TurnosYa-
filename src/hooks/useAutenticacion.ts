import { useCallback, useState } from 'react';

import { iniciarSesion as iniciarSesionServicio, registrarse as registrarseServicio } from '@/services/auth';

/** Estado de los formularios de Login y Registro. La sesión nueva llega por useSesion. */
export function useAutenticacion() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarSesion = useCallback(async (email: string, contrasena: string) => {
    setEnviando(true);
    setError(null);
    const resultado = await iniciarSesionServicio(email.trim(), contrasena);
    setError(resultado.error);
    setEnviando(false);
  }, []);

  /** Devuelve true si la cuenta se creó pero falta confirmar el email para entrar. */
  const registrarse = useCallback(async (nombre: string, email: string, contrasena: string) => {
    setEnviando(true);
    setError(null);
    const resultado = await registrarseServicio(nombre.trim(), email.trim(), contrasena);
    setError(resultado.error);
    setEnviando(false);
    return resultado.data?.sesionIniciada === false;
  }, []);

  return { enviando, error, iniciarSesion, registrarse };
}
