import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { alturaTactilMinima, colores, espaciados, radioBorde } from '@/theme';

type Props = Omit<TextInputProps, 'style'> & {
  etiqueta: string;
  error?: string | null;
};

export function Campo({ etiqueta, error, ...propsDelInput }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSuave}
        style={[styles.input, error ? styles.inputConError : null]}
        {...propsDelInput}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciados.s,
  },
  etiqueta: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  input: {
    minHeight: alturaTactilMinima,
    paddingHorizontal: espaciados.m,
    fontSize: 16,
    color: colores.texto,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
  },
  inputConError: {
    borderColor: colores.error,
  },
  error: {
    fontSize: 14,
    color: colores.error,
  },
});
