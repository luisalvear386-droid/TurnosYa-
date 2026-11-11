import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alturaTactilMinima, colores, espaciados, radioBorde } from '@/theme';
import { textoDeHora } from '@/utils/fechas';

type Props = {
  etiqueta: string;
  /** Hora entera: 0 a 24 (24 = medianoche de cierre). */
  valor: number;
  minimo: number;
  maximo: number;
  alCambiar: (valor: number) => void;
};

function BotonPaso({
  signo,
  descripcion,
  habilitado,
  alPresionar,
}: {
  signo: string;
  descripcion: string;
  habilitado: boolean;
  alPresionar: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descripcion}
      accessibilityState={{ disabled: !habilitado }}
      disabled={!habilitado}
      onPress={alPresionar}
      style={({ pressed }) => [styles.boton, pressed && styles.botonPresionado]}>
      <Text style={[styles.signo, !habilitado && styles.signoDeshabilitado]}>{signo}</Text>
    </Pressable>
  );
}

/** Hora entera que se cambia de a una con los botones − y +. */
export function SelectorHora({ etiqueta, valor, minimo, maximo, alCambiar }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.fila}>
        <BotonPaso
          signo="−"
          descripcion={`${etiqueta}: una hora antes`}
          habilitado={valor > minimo}
          alPresionar={() => alCambiar(valor - 1)}
        />
        <Text style={styles.valor} accessibilityLabel={`${etiqueta}: ${textoDeHora(valor)}`}>
          {textoDeHora(valor)}
        </Text>
        <BotonPaso
          signo="+"
          descripcion={`${etiqueta}: una hora después`}
          habilitado={valor < maximo}
          alPresionar={() => alCambiar(valor + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    gap: espaciados.s,
  },
  etiqueta: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
    backgroundColor: colores.superficie,
  },
  boton: {
    width: alturaTactilMinima,
    height: alturaTactilMinima,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radioBorde,
  },
  botonPresionado: {
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
  valor: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    color: colores.texto,
  },
});
