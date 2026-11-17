import { router } from 'expo-router';
import { useState } from 'react';

import { Boton } from '@/components/Boton';
import { Campo } from '@/components/Campo';
import { Formulario } from '@/components/Formulario';
import { useAutenticacion } from '@/hooks/useAutenticacion';
import { validarContrasena, validarDni, validarNombre } from '@/utils/validaciones';

type Errores = {
  nombre?: string | null;
  dni?: string | null;
  contrasena?: string | null;
};

export default function Registro() {
  const { enviando, error, registrarse } = useAutenticacion();
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  function enviar() {
    const nuevosErrores = {
      nombre: validarNombre(nombre),
      dni: validarDni(dni),
      contrasena: validarContrasena(contrasena),
    };
    setErrores(nuevosErrores);
    if (!nuevosErrores.nombre && !nuevosErrores.dni && !nuevosErrores.contrasena) {
      void registrarse(nombre, dni, contrasena);
    }
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
        autoComplete="new-password"
        secureTextEntry
      />
      <Boton texto="Registrate" alPresionar={enviar} cargando={enviando} />
      <Boton
        texto="¿Ya tenés cuenta? Iniciá sesión"
        alPresionar={() => router.back()}
        variante="secundario"
      />
    </Formulario>
  );
}
