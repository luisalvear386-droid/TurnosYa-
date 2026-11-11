import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CajaError } from '@/components/CajaError';
import { Campo } from '@/components/Campo';
import { CampoInterruptor } from '@/components/CampoInterruptor';
import { PantallaError } from '@/components/PantallaError';
import { useCancha } from '@/hooks/useCancha';
import type { DatosCancha } from '@/services/canchas';
import { colores, espaciados } from '@/theme';
import type { Cancha } from '@/types/tablas';
import { validarNombreCancha } from '@/utils/validaciones';

type PropsFormulario = {
  /** Null en un alta. */
  inicial: Cancha | null;
  enviando: boolean;
  errorEnvio: string | null;
  guardar: (valores: DatosCancha) => Promise<boolean>;
  eliminar: () => Promise<boolean>;
};

function FormularioCancha({ inicial, enviando, errorEnvio, guardar, eliminar }: PropsFormulario) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [activa, setActiva] = useState(inicial?.activa ?? true);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  async function enviar() {
    const error = validarNombreCancha(nombre);
    setErrorNombre(error);
    if (!error && (await guardar({ nombre, descripcion, activa }))) {
      router.back();
    }
  }

  async function eliminarYVolver() {
    if (await eliminar()) {
      router.back();
    }
  }

  function confirmarEliminacion() {
    Alert.alert(
      '¿Eliminás la cancha?',
      `Se va a borrar "${inicial?.nombre ?? ''}". Si tiene reservas no se puede eliminar: desactivala.`,
      [
        { text: 'Cancelá', style: 'cancel' },
        { text: 'Eliminá', style: 'destructive', onPress: () => void eliminarYVolver() },
      ],
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {errorEnvio ? <CajaError mensaje={errorEnvio} /> : null}
        <Campo
          etiqueta="Nombre"
          value={nombre}
          onChangeText={setNombre}
          error={errorNombre}
          placeholder="Ej.: Cancha 1"
          autoCapitalize="sentences"
        />
        <Campo
          etiqueta="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Ej.: Fútbol 5, techada"
          autoCapitalize="sentences"
          multiline
        />
        <CampoInterruptor
          etiqueta="Activa"
          ayuda="Si la desactivás, no aparece en la grilla de reservas."
          valor={activa}
          alCambiar={setActiva}
        />
        <Boton
          texto={inicial ? 'Guardá los cambios' : 'Agregá la cancha'}
          alPresionar={() => void enviar()}
          cargando={enviando}
        />
        {inicial ? (
          <Boton
            texto="Eliminá la cancha"
            alPresionar={confirmarEliminacion}
            cargando={enviando}
            variante="secundario"
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function EditarCancha() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const esNueva = id === 'nuevo';
  const { datos, cargando, error, recargar, enviando, errorEnvio, guardar, eliminar } = useCancha(
    esNueva ? null : id,
  );

  let contenido;
  if (cargando) {
    contenido = (
      <View style={styles.centrado}>
        <ActivityIndicator color={colores.primario} size="large" />
      </View>
    );
  } else if (error) {
    contenido = <PantallaError mensaje={error} alReintentar={() => void recargar()} />;
  } else {
    contenido = (
      <FormularioCancha
        inicial={datos}
        enviando={enviando}
        errorEnvio={errorEnvio}
        guardar={guardar}
        eliminar={eliminar}
      />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: esNueva ? 'Nueva cancha' : 'Editar cancha' }} />
      {contenido}
    </>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: espaciados.m,
    padding: espaciados.m,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
});
