import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciados, radioBorde } from '@/theme';

/** Error del servicio, arriba de un formulario o de una lista. */
export function CajaError({ mensaje }: { mensaje: string }) {
  return (
    <View accessibilityRole="alert" style={styles.caja}>
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    padding: espaciados.m,
    borderWidth: 1,
    borderColor: colores.error,
    borderRadius: radioBorde,
    backgroundColor: colores.superficie,
  },
  texto: {
    fontSize: 14,
    color: colores.error,
  },
});
