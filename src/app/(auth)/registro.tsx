import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Formulario } from '@/components/Formulario';
import { useAutenticacion } from '@/hooks/useAutenticacion';
import { colores } from '@/theme';
import { validarContrasena, validarEmail, validarNombre } from '@/utils/validaciones';

type Errores = {
  nombre?: string | null;
  email?: string | null;
  contrasena?: string | null;
};

export default function Registro() {
  const { enviando, error, registrarse } = useAutenticacion();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [faltaConfirmar, setFaltaConfirmar] = useState(false);

  async function enviar() {
    const nuevosErrores = {
      nombre: validarNombre(nombre),
      email: validarEmail(email),
      contrasena: validarContrasena(contrasena),
    };
    setErrores(nuevosErrores);
    if (!nuevosErrores.nombre && !nuevosErrores.email && !nuevosErrores.contrasena) {
      setFaltaConfirmar(await registrarse(nombre, email, contrasena));
    }
  }

  if (faltaConfirmar) {
    return (
      <Formulario titulo="Revisá tu email" subtitulo="Tu cuenta ya está creada.">
        <Text style={styles.aviso}>
          Te mandamos un email para confirmar la cuenta. Después de confirmarla, iniciá sesión.
        </Text>
        <Boton texto="Volver a iniciar sesión" alPresionar={() => router.back()} />
      </Formulario>
    );
  }

  return (
    <Formulario titulo="Creá tu cuenta" subtitulo="Registrate para reservar tu turno." error={error}>
      <Campo
        etiqueta="Nombre"
        value={nombre}
        onChangeText={setNombre}
        error={errores.nombre}
        autoCapitalize="words"
        autoComplete="name"
      />
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
        autoComplete="new-password"
        secureTextEntry
      />
      <Boton texto="Registrate" alPresionar={() => void enviar()} cargando={enviando} />
      <Boton
        texto="¿Ya tenés cuenta? Iniciá sesión"
        alPresionar={() => router.back()}
        variante="secundario"
      />
    </Formulario>
  );
}

const styles = StyleSheet.create({
  aviso: {
    fontSize: 16,
    color: colores.texto,
  },
});
