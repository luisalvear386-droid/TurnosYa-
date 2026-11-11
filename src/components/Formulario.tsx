import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CajaError } from '@/components/CajaError';
import { colores, espaciados } from '@/theme';

type Props = {
  titulo: string;
  subtitulo: string;
  /** Error del servicio: se muestra arriba del formulario. */
  error?: string | null;
  children: ReactNode;
};

/** Marco de los formularios de pantalla completa: el teclado no tapa los campos. */
export function Formulario({ titulo, subtitulo, error, children }: Props) {
  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView behavior="padding" style={styles.pantalla}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.encabezado}>
            <Text style={styles.marca}>TurnosYa!</Text>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.subtitulo}>{subtitulo}</Text>
          </View>
          {error ? <CajaError mensaje={error} /> : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: espaciados.m,
    padding: espaciados.l,
  },
  encabezado: {
    gap: espaciados.s,
    marginBottom: espaciados.s,
  },
  marca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.primario,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: 14,
    color: colores.textoSuave,
  },
});
