import { router } from 'expo-router';
import { useState } from 'react';

import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Formulario } from '@/components/Formulario';
import { useAutenticacion } from '@/hooks/useAutenticacion';
import { validarContrasena, validarDni } from '@/utils/validaciones';

type Errores = {
  dni?: string | null;
  contrasena?: string | null;
};

export default function Login() {
  const { enviando, error, iniciarSesion } = useAutenticacion();
  const [dni, setDni] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  function enviar() {
    const nuevosErrores = {
      dni: validarDni(dni),
      contrasena: validarContrasena(contrasena),
    };
    setErrores(nuevosErrores);
    if (!nuevosErrores.dni && !nuevosErrores.contrasena) {
      void iniciarSesion(dni, contrasena);
    }
  }

  return (
    <Formulario titulo="Iniciá sesión" subtitulo="Entrá para reservar tu turno." error={error}>
      <Campo
        etiqueta="DNI"
        value={dni}
        onChangeText={setDni}
        error={errores.dni}
        placeholder="Sin puntos"
        autoComplete="off"
        keyboardType="number-pad"
        maxLength={8}
      />
      <Campo
        etiqueta="Contraseña"
        value={contrasena}
        onChangeText={setContrasena}
        error={errores.contrasena}
        autoCapitalize="none"
        autoComplete="current-password"
        secureTextEntry
      />
      <Boton texto="Iniciá sesión" alPresionar={enviar} cargando={enviando} />
      <Boton
        texto="¿No tenés cuenta? Registrate"
        alPresionar={() => router.push('/registro')}
        variante="secundario"
      />
    </Formulario>
  );
}
