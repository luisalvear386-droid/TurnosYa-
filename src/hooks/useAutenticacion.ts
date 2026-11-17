import { useCallback, useState } from 'react';

import { iniciarSesion as iniciarSesionServicio, registrarse as registrarseServicio } from '@/services/auth';

/** Estado de los formularios de Login y Registro. La sesión nueva llega por useSesion. */
export function useAutenticacion() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarSesion = useCallback(async (dni: string, contrasena: string) => {
    setEnviando(true);
    setError(null);
    const resultado = await iniciarSesionServicio(dni.trim(), contrasena);
    setError(resultado.error);
    setEnviando(false);
  }, []);

  const registrarse = useCallback(async (nombre: string, dni: string, contrasena: string) => {
    setEnviando(true);
    setError(null);
    const resultado = await registrarseServicio(nombre.trim(), dni.trim(), contrasena);
    setError(resultado.error);
    setEnviando(false);
  }, []);

  return { enviando, error, iniciarSesion, registrarse };
}
