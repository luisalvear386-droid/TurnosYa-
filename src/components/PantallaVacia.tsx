import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciados } from '@/theme';

/** Estado vacío de una pantalla: un mensaje centrado. */
export function PantallaVacia({ mensaje }: { mensaje: string }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.mensaje}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciados.l,
    backgroundColor: colores.fondo,
  },
  mensaje: {
    fontSize: 16,
    textAlign: 'center',
    color: colores.textoSuave,
  },
});
