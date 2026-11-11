import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useSesion } from '@/hooks/useSesion';
import { obtenerCanchas } from '@/services/canchas';
import { obtenerHorarios } from '@/services/horarios';
import { programarRecordatorio, type ResultadoRecordatorio } from '@/services/recordatorios';
import { crearReserva, type DatosTurno, obtenerTurnosOcupados } from '@/services/reservas';
import type { Cancha, HorarioAtencion } from '@/types/tablas';
import { ahoraEnElComplejo, horaDeTexto, sumarDias } from '@/utils/fechas';

/** Días que muestra la grilla: hoy y los 6 siguientes. */
export const DIAS_DE_LA_GRILLA = 7;

export type DatosGrilla = {
  /** Solo las activas: las inactivas no aparecen en la grilla. */
  canchas: Cancha[];
  horarios: HorarioAtencion[];
  /** Claves de `claveTurno` de los turnos ya reservados. */
  ocupados: Set<string>;
};

export function claveTurno(canchaId: string, fecha: string, hora: number): string {
  return `${canchaId}|${fecha}|${hora}`;
}

/** Grilla de turnos del jugador. Se vuelve a cargar cada vez que la pantalla queda visible. */
export function useGrilla() {
  const { datos: perfil } = useSesion();
  const [datos, setDatos] = useState<DatosGrilla | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    const hoy = ahoraEnElComplejo().fecha;
    const [canchas, horarios, ocupados] = await Promise.all([
      obtenerCanchas(),
      obtenerHorarios(),
      obtenerTurnosOcupados(hoy, sumarDias(hoy, DIAS_DE_LA_GRILLA - 1)),
    ]);
    // Si falla una recarga, se sigue mostrando la grilla anterior.
    if (canchas.data && horarios.data && ocupados.data) {
      setDatos({
        canchas: canchas.data.filter((cancha) => cancha.activa),
        horarios: horarios.data,
        ocupados: new Set(
          ocupados.data.map((turno) =>
            claveTurno(turno.cancha_id, turno.fecha, horaDeTexto(turno.hora_inicio)),
          ),
        ),
      });
    }
    setError(canchas.error ?? horarios.error ?? ocupados.error);
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  /** Reserva el turno, programa el recordatorio y recarga la grilla. */
  const reservar = useCallback(
    async (
      turno: DatosTurno,
      nombreCancha: string,
    ): Promise<{ error: string | null; recordatorio: ResultadoRecordatorio | null }> => {
      if (!perfil) {
        return { error: 'No se pudieron cargar tus datos. Volvé a iniciar sesión.', recordatorio: null };
      }
      const resultado = await crearReserva(turno, perfil.id);
      const recordatorio = resultado.data
        ? await programarRecordatorio({
            reservaId: resultado.data,
            nombreCancha,
            fecha: turno.fecha,
            horaInicio: turno.hora_inicio,
          })
        : null;
      await recargar();
      return { error: resultado.error, recordatorio };
    },
    [perfil, recargar],
  );

  return { datos, cargando, error, recargar, reservar };
}
