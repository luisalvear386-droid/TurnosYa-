import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alturaTactilMinima, colores, radioBorde } from '@/theme';
import { sumarDias, textoDeFecha } from '@/utils/fechas';

type Props = {
  /** "AAAA-MM-DD". */
  fecha: string;
  /** Fecha de hoy en el complejo, para mostrar "Hoy". */
  hoy: string;
  /** Sin mínimo o máximo, se puede ir a cualquier fecha. */
  minimo?: string;
  maximo?: string;
  alCambiar: (fecha: string) => void;
};

function Flecha({
  signo,
  descripcion,
  habilitada,
  alPresionar,
}: {
  signo: string;
  descripcion: string;
  habilitada: boolean;
  alPresionar: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descripcion}
      accessibilityState={{ disabled: !habilitada }}
      disabled={!habilitada}
      onPress={alPresionar}
      style={({ pressed }) => [styles.flecha, pressed && styles.flechaPresionada]}>
      <Text style={[styles.signo, !habilitada && styles.signoDeshabilitado]}>{signo}</Text>
    </Pressable>
  );
}

/** Cambia de día con flechas. */
export function SelectorFecha({ fecha, hoy, minimo, maximo, alCambiar }: Props) {
  const relativo = fecha === hoy ? 'Hoy' : fecha === sumarDias(hoy, 1) ? 'Mañana' : null;

  return (
    <View style={styles.contenedor}>
      <Flecha
        signo="‹"
        descripcion="Día anterior"
        habilitada={!minimo || fecha > minimo}
        alPresionar={() => alCambiar(sumarDias(fecha, -1))}
      />
      <View style={styles.textos} accessibilityLiveRegion="polite">
        <Text style={styles.fecha}>{textoDeFecha(fecha)}</Text>
        {relativo ? <Text style={styles.relativo}>{relativo}</Text> : null}
      </View>
      <Flecha
        signo="›"
        descripcion="Día siguiente"
        habilitada={!maximo || fecha < maximo}
        alPresionar={() => alCambiar(sumarDias(fecha, 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
  },
  flecha: {
    width: alturaTactilMinima,
    height: alturaTactilMinima,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radioBorde,
  },
  flechaPresionada: {
    backgroundColor: colores.libre,
  },
  signo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.primario,
  },
  signoDeshabilitado: {
    color: colores.borde,
  },
  textos: {
    flex: 1,
    alignItems: 'center',
  },
  fecha: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  relativo: {
    fontSize: 14,
    color: colores.textoSuave,
  },
});
