import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { colores, espaciados } from '@/theme';

type Props = {
  mensaje: string;
  alReintentar: () => void;
};

/** Estado de error de una pantalla: el mensaje y un botón para reintentar. */
export function PantallaError({ mensaje, alReintentar }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.mensaje}>{mensaje}</Text>
      <Boton texto="Reintentá" alPresionar={alReintentar} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    gap: espaciados.m,
    padding: espaciados.l,
    backgroundColor: colores.fondo,
  },
  mensaje: {
    fontSize: 16,
    textAlign: 'center',
    color: colores.error,
  },
});
