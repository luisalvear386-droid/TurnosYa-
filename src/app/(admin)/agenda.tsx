import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Boton } from '@/components/Boton';
import { CajaError } from '@/components/CajaError';
import { Campo } from '@/components/Campo';
import { SelectorFecha } from '@/components/SelectorFecha';
import { type DatosAgenda, useAgenda } from '@/hooks/useAgenda';
import type { DatosTurno } from '@/services/reservas';
import { alturaTactilMinima, colores, espaciados, radioBorde } from '@/theme';
import type { Cancha, ReservaDeAgenda } from '@/types/tablas';
import {
  type Ahora,
  ahoraEnElComplejo,
  diaDeLaSemana,
  horaDeTexto,
  horaParaBase,
  horasDeTurnos,
  textoDeFecha,
  textoDeHora,
  turnoYaEmpezo,
} from '@/utils/fechas';
import { validarNombreCliente } from '@/utils/validaciones';

/** Turno libre elegido para cargar una reserva manual. */
type TurnoElegido = { cancha: Cancha; hora: number };

function nombreDeReserva(reserva: ReservaDeAgenda): string {
  return reserva.jugador?.nombre ?? reserva.nombre_cliente ?? 'Sin nombre';
}

type PropsCancha = {
  cancha: Cancha;
  horas: number[];
  reservas: ReservaDeAgenda[];
  fecha: string;
  ahora: Ahora;
  cancelandoId: string | null;
  alCargar: (turno: TurnoElegido) => void;
  alCancelar: (reserva: ReservaDeAgenda) => void;
};

/** Turnos de una cancha en el día: reservados con su nombre, o libres. */
function AgendaDeCancha({
  cancha,
  horas,
  reservas,
  fecha,
  ahora,
  cancelandoId,
  alCargar,
  alCancelar,
}: PropsCancha) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.filaTitulo}>
        <Text style={styles.nombreCancha}>{cancha.nombre}</Text>
        {cancha.activa ? null : <Text style={styles.etiquetaInactiva}>Inactiva</Text>}
      </View>
      {horas.map((hora) => {
        const reserva = reservas.find((r) => horaDeTexto(r.hora_inicio) === hora);
        const yaEmpezo = turnoYaEmpezo(fecha, hora, ahora);
        return (
          <View key={hora} style={styles.filaTurno}>
            <Text style={styles.hora}>{textoDeHora(hora)}</Text>
            {reserva ? (
              <>
                <View style={styles.datosReserva}>
                  <Text style={styles.nombre}>
                    {nombreDeReserva(reserva)}
                    {/* El DNI sirve para verificar en persona al jugador que reservó por la app. */}
                    {reserva.jugador ? (
                      <Text style={styles.dni}> · DNI {reserva.jugador.dni}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.tipo}>{reserva.jugador_id ? 'Desde la app' : 'Manual'}</Text>
                </View>
                <Boton
                  texto="Cancelá"
                  alPresionar={() => alCancelar(reserva)}
                  cargando={cancelandoId === reserva.id}
                  variante="secundario"
                />
              </>
            ) : (
              <>
                <Text style={[styles.datosReserva, styles.libre]}>{yaEmpezo ? '—' : 'Libre'}</Text>
                {!yaEmpezo && cancha.activa ? (
                  <Boton
                    texto="Cargá"
                    alPresionar={() => alCargar({ cancha, hora })}
                    variante="secundario"
                  />
                ) : null}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

type PropsDia = {
  datos: DatosAgenda;
  ahora: Ahora;
  cancelandoId: string | null;
  alCargar: (turno: TurnoElegido) => void;
  alCancelar: (reserva: ReservaDeAgenda) => void;
};

function AgendaDelDia({ datos, ahora, cancelandoId, alCargar, alCancelar }: PropsDia) {
  const horario = datos.horarios.find((h) => h.dia_semana === diaDeLaSemana(datos.fecha));
  const horasDelHorario = horario ? horasDeTurnos(horario.hora_apertura, horario.hora_cierre) : [];

  // Canchas activas, más las inactivas que tengan reservas ese día.
  const canchas = datos.canchas.filter(
    (cancha) => cancha.activa || datos.reservas.some((r) => r.cancha_id === cancha.id),
  );

  if (canchas.length === 0) {
    return <Text style={styles.aviso}>Todavía no hay canchas. Agregalas en la tab Canchas.</Text>;
  }
  if (!horario && datos.reservas.length === 0) {
    return <Text style={styles.aviso}>El complejo está cerrado este día.</Text>;
  }

  return (
    <>
      <Text style={styles.resumen}>
        {datos.reservas.length === 1 ? '1 reserva' : `${datos.reservas.length} reservas`}
        {horario ? '' : ' · el complejo está cerrado este día'}
      </Text>
      {canchas.map((cancha) => {
        const reservas = datos.reservas.filter((r) => r.cancha_id === cancha.id);
        // También se muestran las reservas que quedaron fuera de un horario que cambió.
        const horas = [
          ...new Set([...horasDelHorario, ...reservas.map((r) => horaDeTexto(r.hora_inicio))]),
        ].sort((a, b) => a - b);
        return (
          <AgendaDeCancha
            key={cancha.id}
            cancha={cancha}
            horas={horas}
            reservas={reservas}
            fecha={datos.fecha}
            ahora={ahora}
            cancelandoId={cancelandoId}
            alCargar={alCargar}
            alCancelar={alCancelar}
          />
        );
      })}
    </>
  );
}

type PropsModal = {
  turno: TurnoElegido;
  fecha: string;
  alCerrar: () => void;
  reservar: (turno: DatosTurno, nombreCliente: string) => Promise<string | null>;
};

/** Formulario de la reserva manual: el nombre del cliente que pidió el turno por teléfono. */
function ModalReservaManual({ turno, fecha, alCerrar, reservar }: PropsModal) {
  const [nombre, setNombre] = useState('');
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const error = validarNombreCliente(nombre);
    setErrorNombre(error);
    if (error) {
      return;
    }
    setEnviando(true);
    setErrorEnvio(null);
    const errorReserva = await reservar(
      { cancha_id: turno.cancha.id, fecha, hora_inicio: horaParaBase(turno.hora) },
      nombre,
    );
    setEnviando(false);
    if (errorReserva) {
      setErrorEnvio(errorReserva);
    } else {
      alCerrar();
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={alCerrar}>
      <KeyboardAvoidingView behavior="padding" style={styles.fondoModal}>
        <View style={styles.modal}>
          <Text style={styles.tituloModal}>Reserva manual</Text>
          <Text style={styles.detalleModal}>
            {turno.cancha.nombre}, {textoDeFecha(fecha)} de {textoDeHora(turno.hora)} a{' '}
            {textoDeHora(turno.hora + 1)}
          </Text>
          {errorEnvio ? <CajaError mensaje={errorEnvio} /> : null}
          <Campo
            etiqueta="Nombre del cliente"
            value={nombre}
            onChangeText={setNombre}
            error={errorNombre}
            autoCapitalize="words"
            autoFocus
          />
          <Boton texto="Reservá" alPresionar={() => void enviar()} cargando={enviando} />
          <Boton texto="Cancelá" alPresionar={alCerrar} variante="secundario" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function Agenda() {
  const hoy = ahoraEnElComplejo().fecha;
  const [fecha, setFecha] = useState(hoy);
  const { datos, cargando, error, recargar, cancelar, reservarManual } = useAgenda(fecha);
  const [turnoElegido, setTurnoElegido] = useState<TurnoElegido | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  async function confirmarCancelacion(reserva: ReservaDeAgenda) {
    setCancelandoId(reserva.id);
    const errorCancelacion = await cancelar(reserva.id);
    setCancelandoId(null);
    if (errorCancelacion) {
      Alert.alert('No se pudo cancelar', errorCancelacion);
    }
  }

  function preguntarCancelacion(reserva: ReservaDeAgenda) {
    const hora = horaDeTexto(reserva.hora_inicio);
    Alert.alert(
      '¿Cancelás la reserva?',
      `${nombreDeReserva(reserva)}: ${reserva.cancha?.nombre ?? 'Cancha'}, ${textoDeFecha(reserva.fecha)} a las ${textoDeHora(hora)}.`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Cancelá', style: 'destructive', onPress: () => void confirmarCancelacion(reserva) },
      ],
    );
  }

  // Los datos de otro día no se muestran mientras carga el elegido.
  const datosDelDia = datos?.fecha === fecha ? datos : null;

  let contenido;
  if (datosDelDia) {
    contenido = (
      <AgendaDelDia
        datos={datosDelDia}
        ahora={ahoraEnElComplejo()}
        cancelandoId={cancelandoId}
        alCargar={setTurnoElegido}
        alCancelar={preguntarCancelacion}
      />
    );
  } else if (error && !cargando) {
    contenido = <Boton texto="Reintentá" alPresionar={() => void recargar()} />;
  } else {
    contenido = <ActivityIndicator color={colores.primario} size="large" />;
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl
            refreshing={cargando && datosDelDia !== null}
            onRefresh={() => void recargar()}
            colors={[colores.primario]}
          />
        }>
        <SelectorFecha fecha={fecha} hoy={hoy} alCambiar={setFecha} />
        {error ? <CajaError mensaje={error} /> : null}
        {contenido}
      </ScrollView>
      {turnoElegido ? (
        <ModalReservaManual
          turno={turnoElegido}
          fecha={fecha}
          alCerrar={() => setTurnoElegido(null)}
          reservar={reservarManual}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
  resumen: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  tarjeta: {
    padding: espaciados.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciados.s,
    marginBottom: espaciados.s,
  },
  nombreCancha: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  etiquetaInactiva: {
    paddingHorizontal: espaciados.s,
    fontSize: 14,
    color: colores.texto,
    backgroundColor: colores.acento,
    borderRadius: radioBorde,
    overflow: 'hidden',
  },
  filaTurno: {
    minHeight: alturaTactilMinima,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciados.m,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  hora: {
    width: espaciados.xl * 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  datosReserva: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    color: colores.texto,
  },
  dni: {
    color: colores.textoSuave,
  },
  tipo: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  libre: {
    fontSize: 16,
    color: colores.textoSuave,
  },
  fondoModal: {
    flex: 1,
    justifyContent: 'center',
    padding: espaciados.m,
    backgroundColor: colores.fondoModal,
  },
  modal: {
    gap: espaciados.m,
    padding: espaciados.l,
    backgroundColor: colores.superficie,
    borderRadius: radioBorde,
  },
  tituloModal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.texto,
  },
  detalleModal: {
    fontSize: 16,
    color: colores.texto,
  },
});
