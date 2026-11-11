import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { obtenerCanchas } from '@/services/canchas';
import { obtenerHorarios } from '@/services/horarios';
import {
  cancelarReserva,
  crearReservaManual,
  type DatosTurno,
  obtenerReservasDelDia,
} from '@/services/reservas';
import type { Cancha, HorarioAtencion, ReservaDeAgenda } from '@/types/tablas';

export type DatosAgenda = {
  /** Día al que corresponden los datos. */
  fecha: string;
  /** Todas, también las inactivas: pueden tener reservas de antes de desactivarlas. */
  canchas: Cancha[];
  horarios: HorarioAtencion[];
  /** Solo las confirmadas del día. */
  reservas: ReservaDeAgenda[];
};

/** Agenda de un día para el admin. Se vuelve a cargar al cambiar de día y al volver a la pantalla. */
export function useAgenda(fecha: string) {
  const [datos, setDatos] = useState<DatosAgenda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Si se cambia de día rápido, solo vale la respuesta del último pedido.
  const ultimoPedido = useRef(0);

  const recargar = useCallback(async () => {
    const pedido = ++ultimoPedido.current;
    setCargando(true);
    const [canchas, horarios, reservas] = await Promise.all([
      obtenerCanchas(),
      obtenerHorarios(),
      obtenerReservasDelDia(fecha),
    ]);
    if (pedido !== ultimoPedido.current) {
      return;
    }
    if (canchas.data && horarios.data && reservas.data) {
      setDatos({ fecha, canchas: canchas.data, horarios: horarios.data, reservas: reservas.data });
    } else {
      // Sin la agenda de este día, no se muestra la de otro.
      setDatos(null);
    }
    setError(canchas.error ?? horarios.error ?? reservas.error);
    setCargando(false);
  }, [fecha]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  /** Cancela la reserva y recarga. Devuelve el mensaje de error o null. */
  const cancelar = useCallback(
    async (id: string) => {
      const resultado = await cancelarReserva(id);
      await recargar();
      return resultado.error;
    },
    [recargar],
  );

  /** Carga una reserva manual y recarga. Devuelve el mensaje de error o null. */
  const reservarManual = useCallback(
    async (turno: DatosTurno, nombreCliente: string) => {
      const resultado = await crearReservaManual(turno, nombreCliente.trim());
      await recargar();
      return resultado.error;
    },
    [recargar],
  );

  return { datos, cargando, error, recargar, cancelar, reservarManual };
}
