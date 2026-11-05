import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { alturaTactilMinima, colores, espaciados, radioBorde } from '@/theme';

type Props = {
  texto: string;
  alPresionar: () => void;
  cargando?: boolean;
  variante?: 'primario' | 'secundario';
};

export function Boton({ texto, alPresionar, cargando = false, variante = 'primario' }: Props) {
  const esPrimario = variante === 'primario';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: cargando, busy: cargando }}
      disabled={cargando}
      onPress={alPresionar}
      style={({ pressed }) => [
        styles.boton,
        esPrimario ? styles.primario : styles.secundario,
        pressed && (esPrimario ? styles.primarioPresionado : styles.secundarioPresionado),
      ]}>
      {cargando ? (
        <ActivityIndicator color={esPrimario ? colores.superficie : colores.primario} />
      ) : (
        <Text style={[styles.texto, esPrimario ? styles.textoPrimario : styles.textoSecundario]}>
          {texto}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: alturaTactilMinima,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espaciados.m,
    borderRadius: radioBorde,
  },
  primario: {
    backgroundColor: colores.primario,
  },
  primarioPresionado: {
    backgroundColor: colores.primarioOscuro,
  },
  secundario: {
    backgroundColor: 'transparent',
  },
  secundarioPresionado: {
    backgroundColor: colores.libre,
  },
  texto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoPrimario: {
    color: colores.superficie,
  },
  textoSecundario: {
    color: colores.primario,
  },
});
