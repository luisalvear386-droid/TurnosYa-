import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { obtenerCanchas } from '@/services/canchas';
import type { Cancha } from '@/types/tablas';

/** Lista de canchas. Se vuelve a cargar cada vez que la pantalla queda visible. */
export function useCanchas() {
  const [datos, setDatos] = useState<Cancha[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    const resultado = await obtenerCanchas();
    // Si falla una recarga, se sigue mostrando la lista anterior.
    if (resultado.data) {
      setDatos(resultado.data);
    }
    setError(resultado.error);
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  return { datos, cargando, error, recargar };
}
