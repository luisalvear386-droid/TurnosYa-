import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { alturaTactilMinima, colores, espaciados, radioBorde } from '@/theme';

type Props = {
  alPresionar: () => void;
  /** Lo que lee el lector de pantalla. */
  descripcion: string;
  children: ReactNode;
};

/** Tarjeta tocable de una lista. */
export function Tarjeta({ alPresionar, descripcion, children }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={descripcion}
      onPress={alPresionar}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    minHeight: alturaTactilMinima,
    gap: espaciados.s,
    padding: espaciados.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
  },
  presionada: {
    backgroundColor: colores.libre,
  },
});
