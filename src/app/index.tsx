import { StyleSheet, Text, View } from 'react-native';

import { useConexion } from '@/hooks/useConexion';
import { colores, espaciados } from '@/theme';

// Pantalla provisoria para probar el cliente de Supabase. Se reemplaza en la tarea 2.4.
export default function Index() {
  const { cargando, error } = useConexion();

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>TurnosYa!</Text>
      {cargando ? (
        <Text style={styles.estado}>Comprobando la conexión…</Text>
      ) : error ? (
        <Text style={[styles.estado, styles.error]}>{error}</Text>
      ) : (
        <Text style={styles.estado}>Conectado a Supabase</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciados.m,
    padding: espaciados.l,
    backgroundColor: colores.fondo,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.primario,
  },
  estado: {
    fontSize: 16,
    textAlign: 'center',
    color: colores.texto,
  },
  error: {
    color: colores.error,
  },
});
