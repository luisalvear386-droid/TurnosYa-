import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { useSesion } from '@/hooks/useSesion';
import { colores, espaciados } from '@/theme';

// Pantalla provisoria para probar el inicio de sesión. Se reemplaza en la tarea 2.5.
export default function Index() {
  const { datos, cargando, error, recargar, cerrarSesion } = useSesion();

  return (
    <View style={styles.contenedor}>
      {cargando ? (
        <ActivityIndicator color={colores.primario} size="large" />
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {datos ? (
            <>
              <Text style={styles.titulo}>¡Hola, {datos.nombre}!</Text>
              <Text style={styles.texto}>Tu rol: {datos.rol}</Text>
            </>
          ) : (
            <Boton texto="Reintentá" alPresionar={() => void recargar()} />
          )}
          <Boton
            texto="Cerrá sesión"
            alPresionar={() => void cerrarSesion()}
            variante="secundario"
          />
        </>
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
    color: colores.texto,
  },
  texto: {
    fontSize: 16,
    color: colores.texto,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    color: colores.error,
  },
});
