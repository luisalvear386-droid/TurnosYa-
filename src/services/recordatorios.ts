// Recordatorios del jugador: notificaciones locales del teléfono (no usan Supabase).
// Regla (docs/producto/reglas-negocio.md): 1 hora antes del turno; si falta menos, no se programa.
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';

import type { ReservaConCancha } from '@/types/tablas';
import { horaDeTexto, inicioDelTurno, textoDeFecha, textoDeHora } from '@/utils/fechas';

const CANAL = 'recordatorios';
const PREFIJO = 'reserva-';
const ANTICIPACION_MS = 60 * 60 * 1000;

/** El identificador de la notificación sale de la reserva: así se cancela sin guardar nada. */
function identificador(reservaId: string): string {
  return `${PREFIJO}${reservaId}`;
}

/** Se llama una vez al abrir la app: muestra los recordatorios aunque la app esté abierta. */
export function configurarRecordatorios(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Crea el canal de Android de los recordatorios y devuelve su id, o undefined para usar
 * el canal por defecto. Va antes de pedir permiso: Android 13 o más nuevo no muestra el
 * pedido hasta que existe un canal.
 *
 * En Expo Go (SDK 58, Poco M6) setNotificationChannelAsync rechaza con un
 * NullPointerException aunque solo recibe name e importance. Un canal que falla no
 * puede impedir el recordatorio: se revisa si quedó creado y, si no, se usa el por defecto.
 */
async function prepararCanal(): Promise<string | undefined> {
  try {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Recordatorios de partidos',
      importance: AndroidImportance.HIGH,
    });
    return CANAL;
  } catch {
    // Se revisa abajo si el canal quedó creado igual.
  }
  try {
    const canal = await Notifications.getNotificationChannelAsync(CANAL);
    return canal ? CANAL : undefined;
  } catch {
    return undefined;
  }
}

/** Pide permiso para notificar si todavía no se dio. */
async function tenerPermiso(): Promise<boolean> {
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) {
    return true;
  }
  if (!actual.canAskAgain) {
    return false;
  }
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

export type ResultadoRecordatorio = 'programado' | 'falta-poco' | 'sin-permiso' | 'error';

type DatosRecordatorio = {
  reservaId: string;
  nombreCancha: string;
  fecha: string;
  /** Formato "HH:00:00". */
  horaInicio: string;
};

/** Programa el recordatorio de una reserva. Si ya estaba programado, lo reemplaza. */
export async function programarRecordatorio(datos: DatosRecordatorio): Promise<ResultadoRecordatorio> {
  const hora = horaDeTexto(datos.horaInicio);
  const momento = new Date(inicioDelTurno(datos.fecha, hora).getTime() - ANTICIPACION_MS);
  if (momento.getTime() <= Date.now()) {
    return 'falta-poco';
  }

  try {
    const canal = await prepararCanal();
    if (!(await tenerPermiso())) {
      return 'sin-permiso';
    }
    await Notifications.scheduleNotificationAsync({
      identifier: identificador(datos.reservaId),
      content: {
        title: 'Tu partido es en 1 hora',
        body: `${datos.nombreCancha}, ${textoDeFecha(datos.fecha)} a las ${textoDeHora(hora)}. ¡No llegues tarde!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: momento,
        // Sin canal propio, Android usa el canal por defecto.
        ...(canal ? { channelId: canal } : {}),
      },
    });
    return 'programado';
  } catch {
    return 'error';
  }
}

/** Cancela el recordatorio de una reserva. Si no estaba programado, no hace nada. */
export async function cancelarRecordatorio(reservaId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identificador(reservaId));
  } catch {
    // Sin recordatorio no hay nada que cancelar.
  }
}

/**
 * Deja programados solo los recordatorios de las reservas confirmadas del jugador.
 * Así se borran los de reservas que canceló el complejo y se recuperan los que falten.
 * No pide permiso: si no lo hay, no hace nada.
 */
export async function sincronizarRecordatorios(reservas: ReservaConCancha[]): Promise<void> {
  try {
    const permiso = await Notifications.getPermissionsAsync();
    if (!permiso.granted) {
      return;
    }
    const confirmadas = new Set(
      reservas.filter((r) => r.estado === 'confirmada').map((r) => identificador(r.id)),
    );
    const programados = await Notifications.getAllScheduledNotificationsAsync();
    const yaProgramados = new Set<string>();
    for (const notificacion of programados) {
      const id = notificacion.identifier;
      if (!id.startsWith(PREFIJO)) {
        continue;
      }
      if (confirmadas.has(id)) {
        yaProgramados.add(id);
      } else {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
    for (const reserva of reservas) {
      if (reserva.estado === 'confirmada' && !yaProgramados.has(identificador(reserva.id))) {
        await programarRecordatorio({
          reservaId: reserva.id,
          nombreCancha: reserva.cancha?.nombre ?? 'Cancha',
          fecha: reserva.fecha,
          horaInicio: reserva.hora_inicio,
        });
      }
    }
  } catch {
    // Los recordatorios son una ayuda: si fallan, la app sigue funcionando.
  }
}

/** Al cerrar sesión: el próximo usuario del teléfono no recibe recordatorios ajenos. */
export async function cancelarTodosLosRecordatorios(): Promise<void> {
  try {
    const programados = await Notifications.getAllScheduledNotificationsAsync();
    for (const notificacion of programados) {
      if (notificacion.identifier.startsWith(PREFIJO)) {
        await Notifications.cancelScheduledNotificationAsync(notificacion.identifier);
      }
    }
  } catch {
    // Sin recordatorios no hay nada que cancelar.
  }
}
