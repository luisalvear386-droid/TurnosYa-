import { useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CajaError } from '@/components/CajaError';
import { CeldaTurno } from '@/components/CeldaTurno';
import { PantallaError } from '@/components/PantallaError';
import { SelectorFecha } from '@/components/SelectorFecha';
import { claveTurno, type DatosGrilla, DIAS_DE_LA_GRILLA, useGrilla } from '@/hooks/useGrilla';
import type { ResultadoRecordatorio } from '@/services/recordatorios';
import { colores, espaciados, radioBorde } from '@/theme';
import type { Cancha } from '@/types/tablas';
import {
  ahoraEnElComplejo,
  diaDeLaSemana,
  horaParaBase,
  horasDeTurnos,
  sumarDias,
  textoDeFecha,
  textoDeHora,
  turnoYaEmpezo,
} from '@/utils/fechas';

/** Lo que se agrega al aviso de la reserva según cómo quedó el recordatorio. */
const AVISO_RECORDATORIO: Record<ResultadoRecordatorio, string> = {
  programado: '\n\nTe vamos a avisar 1 hora antes.',
  'falta-poco': '',
  'sin-permiso':
    '\n\nPara recibir el recordatorio 1 hora antes, activá las notificaciones de la app en los ajustes del teléfono.',
  error: '\n\nNo se pudo programar el recordatorio.',
};

type PropsGrilla = {
  datos: DatosGrilla;
  fecha: string;
  reservando: boolean;
  alElegir: (cancha: Cancha, hora: number) => void;
};

/** Turnos del día elegido, agrupados por cancha. */
function GrillaDelDia({ datos, fecha, reservando, alElegir }: PropsGrilla) {
  if (datos.canchas.length === 0) {
    return <Text style={styles.aviso}>Todavía no hay canchas disponibles.</Text>;
  }

  const horario = datos.horarios.find((h) => h.dia_semana === diaDeLaSemana(fecha));
  if (!horario) {
    return <Text style={styles.aviso}>El complejo está cerrado este día. Elegí otro.</Text>;
  }

  const ahora = ahoraEnElComplejo();
  const horas = horasDeTurnos(horario.hora_apertura, horario.hora_cierre).filter(
    (hora) => !turnoYaEmpezo(fecha, hora, ahora),
  );
  if (horas.length === 0) {
    return <Text style={styles.aviso}>Ya no quedan turnos para este día. Elegí otro.</Text>;
  }

  return (
    <>
      {datos.canchas.map((cancha) => (
        <View key={cancha.id} style={styles.tarjeta}>
          <Text style={styles.nombreCancha}>{cancha.nombre}</Text>
          {cancha.descripcion ? <Text style={styles.descripcion}>{cancha.descripcion}</Text> : null}
          <View style={styles.celdas}>
            {horas.map((hora) => (
              <CeldaTurno
                key={hora}
                hora={hora}
                libre={!datos.ocupados.has(claveTurno(cancha.id, fecha, hora))}
                deshabilitada={reservando}
                alPresionar={() => alElegir(cancha, hora)}
              />
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

export default function Reservar() {
  const { datos, cargando, error, recargar, reservar } = useGrilla();
  const hoy = ahoraEnElComplejo().fecha;
  const ultimoDia = sumarDias(hoy, DIAS_DE_LA_GRILLA - 1);
  const [fechaElegida, setFechaElegida] = useState(hoy);
  const [reservando, setReservando] = useState(false);

  // Si la app quedó abierta de un día para otro, no se muestran días pasados.
  const fecha = fechaElegida < hoy ? hoy : fechaElegida;

  async function confirmarReserva(cancha: Cancha, hora: number) {
    setReservando(true);
    const { error: errorReserva, recordatorio } = await reservar(
      { cancha_id: cancha.id, fecha, hora_inicio: horaParaBase(hora) },
      cancha.nombre,
    );
    setReservando(false);
    if (errorReserva) {
      Alert.alert('No se pudo reservar', errorReserva);
    } else {
      Alert.alert(
        '¡Listo!',
        `Reservaste ${cancha.nombre} el ${textoDeFecha(fecha)} a las ${textoDeHora(hora)}. La ves en Mis reservas.${
          recordatorio ? AVISO_RECORDATORIO[recordatorio] : ''
        }`,
      );
    }
  }

  function elegirTurno(cancha: Cancha, hora: number) {
    Alert.alert(
      '¿Confirmás la reserva?',
      `${cancha.nombre}, ${textoDeFecha(fecha)} de ${textoDeHora(hora)} a ${textoDeHora(hora + 1)}.`,
      [
        { text: 'Cancelá', style: 'cancel' },
        { text: 'Reservá', onPress: () => void confirmarReserva(cancha, hora) },
      ],
    );
  }

  if (!datos) {
    if (error) {
      return <PantallaError mensaje={error} alReintentar={() => void recargar()} />;
    }
    return (
      <View style={styles.centrado}>
        <ActivityIndicator color={colores.primario} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contenido}
      refreshControl={
        <RefreshControl
          refreshing={cargando}
          onRefresh={() => void recargar()}
          colors={[colores.primario]}
        />
      }>
      <SelectorFecha
        fecha={fecha}
        hoy={hoy}
        minimo={hoy}
        maximo={ultimoDia}
        alCambiar={setFechaElegida}
      />
      {error ? <CajaError mensaje={error} /> : null}
      {reservando ? <ActivityIndicator color={colores.primario} /> : null}
      <GrillaDelDia datos={datos} fecha={fecha} reservando={reservando} alElegir={elegirTurno} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: espaciados.m,
    padding: espaciados.m,
  },
  aviso: {
    padding: espaciados.l,
    fontSize: 16,
    textAlign: 'center',
    color: colores.textoSuave,
  },
  tarjeta: {
    gap: espaciados.s,
    padding: espaciados.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
  },
  nombreCancha: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  descripcion: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  celdas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciados.s,
  },
});
