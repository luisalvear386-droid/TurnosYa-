import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProveedorSesion, useSesion } from '@/hooks/useSesion';
import { colores } from '@/theme';

function Navegacion() {
  const { iniciando, sesionIniciada } = useSesion();

  if (iniciando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color={colores.primario} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={sesionIniciada}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!sesionIniciada}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/registro" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ProveedorSesion>
      <Navegacion />
    </ProveedorSesion>
  );
}

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
});
