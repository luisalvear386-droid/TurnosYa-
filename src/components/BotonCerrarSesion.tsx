import { useState } from 'react';
import { Alert } from 'react-native';

import { Boton } from '@/components/Boton';
import { useSesion } from '@/hooks/useSesion';

export function BotonCerrarSesion() {
  const { cerrarSesion } = useSesion();
  const [enviando, setEnviando] = useState(false);

  async function cerrar() {
    setEnviando(true);
    const error = await cerrarSesion();
    setEnviando(false);
    if (error) {
      Alert.alert('No se pudo cerrar la sesión', error);
    }
  }

  return (
    <Boton
      texto="Cerrá sesión"
      alPresionar={() => void cerrar()}
      cargando={enviando}
      variante="secundario"
    />
  );
}
