import { useCallback, useEffect, useState } from 'react';

import { comprobarConexion } from '@/services/conexion';
import type { Resultado } from '@/types/resultado';

export function useConexion() {
  const [datos, setDatos] = useState<true | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const aplicarResultado = useCallback((resultado: Resultado<true>) => {
    setDatos(resultado.data);
    setError(resultado.error);
    setCargando(false);
  }, []);

  useEffect(() => {
    void comprobarConexion().then(aplicarResultado);
  }, [aplicarResultado]);

  const recargar = useCallback(async () => {
    setCargando(true);
    aplicarResultado(await comprobarConexion());
  }, [aplicarResultado]);

  return { datos, cargando, error, recargar };
}
