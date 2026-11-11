import { Pressable, StyleSheet, Text } from 'react-native';

import { alturaTactilMinima, colores, espaciados, radioBorde } from '@/theme';
import { textoDeHora } from '@/utils/fechas';

type Props = {
  hora: number;
  libre: boolean;
  /** True mientras se guarda otra reserva. */
  deshabilitada?: boolean;
  alPresionar: () => void;
};

/** Celda de un turno de la grilla: libre (se puede tocar) u ocupado. */
export function CeldaTurno({ hora, libre, deshabilitada = false, alPresionar }: Props) {
  const texto = textoDeHora(hora);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${texto}, ${libre ? 'libre' : 'ocupado'}`}
      accessibilityState={{ disabled: !libre || deshabilitada }}
      disabled={!libre || deshabilitada}
      onPress={alPresionar}
      style={({ pressed }) => [
        styles.celda,
        libre ? styles.libre : styles.ocupada,
        pressed && styles.presionada,
      ]}>
      <Text style={[styles.hora, !libre && styles.textoOcupado]}>{texto}</Text>
      <Text style={[styles.estado, !libre && styles.textoOcupado]}>{libre ? 'Libre' : 'Ocupado'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  celda: {
    width: '31%',
    minHeight: alturaTactilMinima,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciados.s,
    borderWidth: 1,
    borderRadius: radioBorde,
  },
  libre: {
    backgroundColor: colores.libre,
    borderColor: colores.primario,
  },
  ocupada: {
    backgroundColor: colores.ocupado,
    borderColor: colores.borde,
  },
  presionada: {
    backgroundColor: colores.borde,
  },
  hora: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.primario,
  },
  estado: {
    fontSize: 14,
    color: colores.primario,
  },
  textoOcupado: {
    color: colores.textoSuave,
  },
});
