import { StyleSheet, Switch, Text, View } from 'react-native';

import { alturaTactilMinima, colores, espaciados } from '@/theme';

type Props = {
  etiqueta: string;
  /** Texto secundario debajo de la etiqueta. */
  ayuda?: string;
  valor: boolean;
  alCambiar: (valor: boolean) => void;
};

/** Campo de sí o no con un interruptor. */
export function CampoInterruptor({ etiqueta, ayuda, valor, alCambiar }: Props) {
  return (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        {ayuda ? <Text style={styles.ayuda}>{ayuda}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={etiqueta}
        value={valor}
        onValueChange={alCambiar}
        thumbColor={valor ? colores.primario : colores.superficie}
        trackColor={{ false: colores.borde, true: colores.libre }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    minHeight: alturaTactilMinima,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciados.m,
  },
  textos: {
    flex: 1,
  },
  etiqueta: {
    fontSize: 16,
    color: colores.texto,
  },
  ayuda: {
    fontSize: 14,
    color: colores.textoSuave,
  },
});
