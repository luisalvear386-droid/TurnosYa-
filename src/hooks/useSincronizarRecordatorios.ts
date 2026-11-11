import { useEffect } from 'react';

import { useSesion } from '@/hooks/useSesion';
import { sincronizarRecordatorios } from '@/services/recordatorios';
import { obtenerMisReservas } from '@/services/reservas';

/**
 * Al entrar como jugador, ajusta los recordatorios a sus reservas confirmadas:
 * borra los de reservas que canceló el complejo y recupera los que falten.
 */
export function useSincronizarRecordatorios() {
  const { datos: perfil } = useSesion();
  const jugadorId = perfil?.rol === 'jugador' ? perfil.id : null;

  useEffect(() => {
    if (!jugadorId) {
      return;
    }
    void obtenerMisReservas(jugadorId).then((resultado) => {
      if (resultado.data) {
        void sincronizarRecordatorios(resultado.data);
      }
    });
  }, [jugadorId]);
}
