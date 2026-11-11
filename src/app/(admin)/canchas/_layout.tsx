import { Stack } from 'expo-router';

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion';
import { colores } from '@/theme';

/** Pila de la tab Canchas: la lista y, encima, el formulario de alta o edición. */
export default function CanchasLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Canchas', headerRight: () => <BotonCerrarSesion /> }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
