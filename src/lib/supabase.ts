import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const claveAnonima = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function crearCliente(urlCliente: string, claveCliente: string) {
  return createClient(urlCliente, claveCliente, {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

// createClient lanza una excepción si la URL o la clave faltan o son inválidas, y al
// ejecutarse durante el import eso tumbaría toda la app. Con el cliente de relleno, la
// app arranca y muestra el error en pantalla.
function iniciarCliente() {
  try {
    return { cliente: crearCliente(url, claveAnonima), configurado: true };
  } catch {
    return {
      cliente: crearCliente('https://sin-configurar.invalid', 'sin-configurar'),
      configurado: false,
    };
  }
}

const { cliente, configurado } = iniciarCliente();

export const supabase = cliente;
export const supabaseConfigurado = configurado;
