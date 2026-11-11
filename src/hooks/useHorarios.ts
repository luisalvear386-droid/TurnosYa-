import { useCallback, useEffect, useState } from 'react';

import { type DatosHorario, guardarHorarios, obtenerHorarios } from '@/services/horarios';
import type { HorarioAtencion } from '@/types/tablas';

/** Horarios de atención de la semana, para verlos y guardarlos. */
export function useHorarios() {
  const [datos, setDatos] = useState<HorarioAtencion[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Sube en cada reintento para volver a cargar los horarios.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si la pantalla se cierra antes de que llegue la respuesta, se descarta.
    let vigente = true;
    void obtenerHorarios().then((resultado) => {
      if (vigente) {
        setDatos(resultado.data);
        setError(resultado.error);
        setCargando(false);
      }
    });
    return () => {
      vigente = false;
    };
  }, [intento]);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  /** Devuelve true si se guardó. */
  const guardar = useCallback(async (abiertos: DatosHorario[], diasCerrados: number[]) => {
    setEnviando(true);
    setErrorEnvio(null);
    const resultado = await guardarHorarios(abiertos, diasCerrados);
    setErrorEnvio(resultado.error);
    setEnviando(false);
    return resultado.error === null;
  }, []);

  return { datos, cargando, error, recargar, enviando, errorEnvio, guardar };
}
