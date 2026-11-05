import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cerrarSesion as cerrarSesionServicio, escucharSesion, obtenerPerfil } from '@/services/auth';
import type { Perfil } from '@/types/tablas';

type Sesion = {
  /** True hasta saber si hay una sesión guardada. */
  iniciando: boolean;
  sesionIniciada: boolean;
  /** Perfil del usuario con sesión iniciada. */
  datos: Perfil | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<Sesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [iniciando, setIniciando] = useState(true);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [datos, setDatos] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usuario vigente, para descartar respuestas de un usuario anterior.
  const usuarioActual = useRef<string | null>(null);

  const cargarPerfil = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    const resultado = await obtenerPerfil(id);
    if (usuarioActual.current !== id) {
      return;
    }
    setDatos(resultado.data);
    setError(resultado.error);
    setCargando(false);
  }, []);

  useEffect(() => {
    return escucharSesion((id) => {
      setIniciando(false);
      // Supabase también avisa al renovar el token: si es el mismo usuario, no hay nada que hacer.
      if (id === usuarioActual.current) {
        return;
      }
      usuarioActual.current = id;
      setUsuarioId(id);
      setDatos(null);
      setError(null);
      setCargando(false);
      if (id) {
        void cargarPerfil(id);
      }
    });
  }, [cargarPerfil]);

  const recargar = useCallback(async () => {
    if (usuarioActual.current) {
      await cargarPerfil(usuarioActual.current);
    }
  }, [cargarPerfil]);

  const cerrarSesion = useCallback(async () => {
    setCargando(true);
    const resultado = await cerrarSesionServicio();
    if (resultado.error) {
      setError(resultado.error);
    }
    setCargando(false);
  }, []);

  const valor = useMemo(
    () => ({
      iniciando,
      sesionIniciada: usuarioId !== null,
      datos,
      cargando,
      error,
      recargar,
      cerrarSesion,
    }),
    [iniciando, usuarioId, datos, cargando, error, recargar, cerrarSesion],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): Sesion {
  const sesion = useContext(ContextoSesion);
  if (!sesion) {
    throw new Error('useSesion se usa dentro de ProveedorSesion');
  }
  return sesion;
}
