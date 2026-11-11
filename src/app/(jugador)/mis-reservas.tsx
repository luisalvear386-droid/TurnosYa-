import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Boton } from '@/components/Boton';
import { CajaError } from '@/components/CajaError';
import { PantallaError } from '@/components/PantallaError';
import { useMisReservas } from '@/hooks/useMisReservas';
import { colores, espaciados, radioBorde } from '@/theme';
import type { EstadoReserva, ReservaConCancha } from '@/types/tablas';
import {
  type Ahora,
  ahoraEnElComplejo,
  horaDeTexto,
  minutosHastaTurno,
  textoDeFecha,
  textoDeHora,
} from '@/utils/fechas';

/** El jugador cancela hasta 2 horas antes del turno (lo controla la base). */
const MINUTOS_MINIMOS_PARA_CANCELAR = 120;

const TEXTO_ESTADO: Record<EstadoReserva, string> = {
  confirmada: 'Confirmada',
  cancelada_jugador: 'La cancelaste',
  cancelada_admin: 'Cancelada por el complejo',
};

function esProxima(reserva: ReservaConCancha, ahora: Ahora): boolean {
  return (
    reserva.estado === 'confirmada' &&
    minutosHastaTurno(reserva.fecha, horaDeTexto(reserva.hora_inicio), ahora) > 0
  );
}

type PropsFila = {
  reserva: ReservaConCancha;
  ahora: Ahora;
  cancelando: boolean;
  alCancelar: (reserva: ReservaConCancha) => void;
};

function FilaReserva({ reserva, ahora, cancelando, alCancelar }: PropsFila) {
  const hora = horaDeTexto(reserva.hora_inicio);
  const proxima = esProxima(reserva, ahora);
  const sePuedeCancelar =
    proxima && minutosHastaTurno(reserva.fecha, hora, ahora) >= MINUTOS_MINIMOS_PARA_CANCELAR;
  const estado = proxima || reserva.estado !== 'confirmada' ? TEXTO_ESTADO[reserva.estado] : 'Jugada';

  return (
    <View style={styles.tarjeta}>
      <View style={styles.filaTitulo}>
        <Text style={styles.cancha}>{reserva.cancha?.nombre ?? 'Cancha'}</Text>
        <Text style={[styles.estado, reserva.estado !== 'confirmada' && styles.estadoCancelada]}>
          {estado}
        </Text>
      </View>
      <Text style={styles.detalle}>
        {textoDeFecha(reserva.fecha)}, de {textoDeHora(hora)} a {textoDeHora(hora + 1)}
      </Text>
      {sePuedeCancelar ? (
        <Boton
          texto="Cancelá la reserva"
          alPresionar={() => alCancelar(reserva)}
          cargando={cancelando}
          variante="secundario"
        />
      ) : null}
      {proxima && !sePuedeCancelar ? (
        <Text style={styles.ayuda}>Ya no se puede cancelar: faltan menos de 2 horas.</Text>
      ) : null}
    </View>
  );
}

export default function MisReservas() {
  const { datos, cargando, error, recargar, cancelar } = useMisReservas();
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  async function confirmarCancelacion(reserva: ReservaConCancha) {
    setCancelandoId(reserva.id);
    const errorCancelacion = await cancelar(reserva.id);
    setCancelandoId(null);
    if (errorCancelacion) {
      Alert.alert('No se pudo cancelar', errorCancelacion);
    }
  }

  function preguntarCancelacion(reserva: ReservaConCancha) {
    const hora = horaDeTexto(reserva.hora_inicio);
    Alert.alert(
      '¿Cancelás la reserva?',
      `${reserva.cancha?.nombre ?? 'Cancha'}, ${textoDeFecha(reserva.fecha)} a las ${textoDeHora(hora)}. El turno queda libre para otros.`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Cancelá', style: 'destructive', onPress: () => void confirmarCancelacion(reserva) },
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

  const ahora = ahoraEnElComplejo();
  // Las próximas, de la más cercana a la más lejana; las anteriores, de la más nueva a la más vieja.
  const proximas = datos.filter((reserva) => esProxima(reserva, ahora)).reverse();
  const anteriores = datos.filter((reserva) => !esProxima(reserva, ahora));
  const secciones = [
    { titulo: 'Próximas', data: proximas },
    { titulo: 'Anteriores y canceladas', data: anteriores },
  ].filter((seccion) => seccion.data.length > 0);

  return (
    <SectionList
      sections={secciones}
      keyExtractor={(reserva) => reserva.id}
      renderItem={({ item }) => (
        <FilaReserva
          reserva={item}
          ahora={ahora}
          cancelando={cancelandoId === item.id}
          alCancelar={preguntarCancelacion}
        />
      )}
      renderSectionHeader={({ section }) => <Text style={styles.seccion}>{section.titulo}</Text>}
      contentContainerStyle={styles.lista}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={cargando}
          onRefresh={() => void recargar()}
          colors={[colores.primario]}
        />
      }
      ListHeaderComponent={error ? <CajaError mensaje={error} /> : undefined}
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Text style={styles.textoVacio}>Todavía no tenés reservas.</Text>
          <Boton texto="Reservá un turno" alPresionar={() => router.navigate('/reservar')} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  lista: {
    gap: espaciados.s,
    padding: espaciados.m,
  },
  seccion: {
    marginTop: espaciados.s,
    fontSize: 14,
    fontWeight: 'bold',
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
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciados.s,
  },
  cancha: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  estado: {
    fontSize: 14,
    color: colores.primario,
  },
  estadoCancelada: {
    color: colores.error,
  },
  detalle: {
    fontSize: 16,
    color: colores.texto,
  },
  ayuda: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  vacio: {
    gap: espaciados.m,
    padding: espaciados.l,
  },
  textoVacio: {
    fontSize: 16,
    textAlign: 'center',
    color: colores.textoSuave,
  },
});
