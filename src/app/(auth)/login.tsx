import { router } from 'expo-router';
import { useState } from 'react';

import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Formulario } from '@/components/Formulario';
import { useAutenticacion } from '@/hooks/useAutenticacion';
import { validarContrasena, validarEmail } from '@/utils/validaciones';

type Errores = {
  email?: string | null;
  contrasena?: string | null;
};

export default function Login() {
  const { enviando, error, iniciarSesion } = useAutenticacion();
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  function enviar() {
    const nuevosErrores = {
      email: validarEmail(email),
      contrasena: validarContrasena(contrasena),
    };
    setErrores(nuevosErrores);
    if (!nuevosErrores.email && !nuevosErrores.contrasena) {
      void iniciarSesion(email, contrasena);
    }
  }

  return (
    <Formulario titulo="Iniciá sesión" subtitulo="Entrá para reservar tu turno." error={error}>
      <Campo
        etiqueta="Email"
        value={email}
        onChangeText={setEmail}
        error={errores.email}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
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
