import { useCallback, useEffect, useState } from 'react';

import {
  actualizarCancha,
  crearCancha,
  type DatosCancha,
  eliminarCancha,
  obtenerCancha,
} from '@/services/canchas';
import type { Cancha } from '@/types/tablas';

/**
 * Formulario de una cancha. Con `id` null es un alta; si no, carga la cancha para editarla.
 * `error` es el error de carga; `errorEnvio`, el de guardar o eliminar.
 */
export function useCancha(id: string | null) {
  const [datos, setDatos] = useState<Cancha | null>(null);
  const [cargando, setCargando] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Sube en cada reintento para volver a cargar la cancha.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!id) {
      return;
    }
    // Si la pantalla se cierra antes de que llegue la respuesta, se descarta.
    let vigente = true;
    void obtenerCancha(id).then((resultado) => {
      if (vigente) {
        setDatos(resultado.data);
        setError(resultado.error);
        setCargando(false);
      }
    });
    return () => {
      vigente = false;
    };
  }, [id, intento]);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  /** Devuelve true si se guardó. */
  const guardar = useCallback(
    async (valores: DatosCancha) => {
      setEnviando(true);
      setErrorEnvio(null);
      const limpios: DatosCancha = {
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion?.trim() || null,
        activa: valores.activa,
      };
      const resultado = id ? await actualizarCancha(id, limpios) : await crearCancha(limpios);
      setErrorEnvio(resultado.error);
      setEnviando(false);
      return resultado.error === null;
    },
    [id],
  );

  /** Devuelve true si se eliminó. */
  const eliminar = useCallback(async () => {
    if (!id) {
      return false;
    }
    setEnviando(true);
    setErrorEnvio(null);
    const resultado = await eliminarCancha(id);
    setErrorEnvio(resultado.error);
    setEnviando(false);
    return resultado.error === null;
  }, [id]);

  return { datos, cargando, error, recargar, enviando, errorEnvio, guardar, eliminar };
}
