import { Tabs } from 'expo-router';
import { type AndroidSymbol, SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';

import { BotonCerrarSesion } from '@/components/BotonCerrarSesion';
import { colores } from '@/theme';

/** Navegador de tabs de cada rol: mismos colores y "Cerrá sesión" en el encabezado. */
export function TabsPrincipales({ children }: { children: ReactNode }) {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarStyle: { backgroundColor: colores.superficie },
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.texto,
        sceneStyle: { backgroundColor: colores.fondo },
        headerRight: () => <BotonCerrarSesion />,
      }}>
      {children}
    </Tabs>
  );
}

export function iconoTab(nombre: AndroidSymbol) {
  return function IconoTab({ color }: { color: ColorValue }) {
    return <SymbolView name={{ android: nombre }} size={24} tintColor={color} />;
  };
}
