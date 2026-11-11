import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSesion } from '@/hooks/useSesion';
import { cancelarRecordatorio, sincronizarRecordatorios } from '@/services/recordatorios';
import { cancelarReserva, obtenerMisReservas } from '@/services/reservas';
import type { ReservaConCancha } from '@/types/tablas';

/** Reservas del jugador. Se vuelven a cargar cada vez que la pantalla queda visible. */
export function useMisReservas() {
  const { datos: perfil } = useSesion();
  const jugadorId = perfil?.id ?? null;
  const [datos, setDatos] = useState<ReservaConCancha[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!jugadorId) {
      return;
    }
    setCargando(true);
    const resultado = await obtenerMisReservas(jugadorId);
    // Si falla una recarga, se sigue mostrando la lista anterior.
    if (resultado.data) {
      setDatos(resultado.data);
      // Borra los recordatorios de reservas que canceló el complejo.
      void sincronizarRecordatorios(resultado.data);
    }
    setError(resultado.error);
    setCargando(false);
  }, [jugadorId]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  /** Cancela la reserva y recarga la lista. Devuelve el mensaje de error o null. */
  const cancelar = useCallback(
    async (id: string) => {
      const resultado = await cancelarReserva(id);
      if (!resultado.error) {
        await cancelarRecordatorio(id);
      }
      await recargar();
      return resultado.error;
    },
    [recargar],
  );

  return { datos, cargando, error, recargar, cancelar };
}
