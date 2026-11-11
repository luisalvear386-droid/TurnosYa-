import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ProveedorSesion, useSesion } from '@/hooks/useSesion';
import { configurarRecordatorios } from '@/services/recordatorios';
import { colores } from '@/theme';

configurarRecordatorios();

function Navegacion() {
  const { iniciando, sesionIniciada, datos } = useSesion();

  if (iniciando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator color={colores.primario} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Sin guard: un guard falso redirige al grupo ("/(admin)"), que no tiene ruta raíz propia. */}
      <Stack.Screen name="index" />
      <Stack.Protected guard={!sesionIniciada}>
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/registro" />
      </Stack.Protected>
      <Stack.Protected guard={datos?.rol === 'jugador'}>
        <Stack.Screen name="(jugador)" />
      </Stack.Protected>
      <Stack.Protected guard={datos?.rol === 'admin'}>
        <Stack.Screen name="(admin)" />
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
