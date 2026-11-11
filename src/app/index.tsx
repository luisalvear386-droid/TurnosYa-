import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { BotonCerrarSesion } from '@/components/BotonCerrarSesion';
import { useSesion } from '@/hooks/useSesion';
import { colores, espaciados } from '@/theme';

// Ruta raíz: lleva a cada uno a su pantalla según la sesión y el rol.
// Solo se ve mientras carga el perfil, o si no se pudo cargar.
export default function Index() {
  const { sesionIniciada, datos, error, recargar } = useSesion();

  if (!sesionIniciada) {
    return <Redirect href="/login" />;
  }
  if (datos?.rol === 'jugador') {
    return <Redirect href="/reservar" />;
  }
  if (datos?.rol === 'admin') {
    return <Redirect href="/agenda" />;
  }

  return (
    <View style={styles.contenedor}>
      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <Boton texto="Reintentá" alPresionar={() => void recargar()} />
          <BotonCerrarSesion />
        </>
      ) : (
        <ActivityIndicator color={colores.primario} size="large" />
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
  error: {
    fontSize: 16,
    textAlign: 'center',
    color: colores.error,
  },
});
