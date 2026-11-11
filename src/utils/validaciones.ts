// Cada validación devuelve el mensaje de error o null si el valor es correcto.

export function validarNombre(nombre: string): string | null {
  return nombre.trim() ? null : 'Ingresá tu nombre';
}

export function validarEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : 'Ingresá un email válido';
}

export function validarNombreCancha(nombre: string): string | null {
  return nombre.trim() ? null : 'Ingresá el nombre de la cancha';
}

/** Horas enteras; el cierre puede ser 24 (medianoche). */
export function validarHorario(apertura: number, cierre: number): string | null {
  return cierre > apertura ? null : 'El cierre tiene que ser después de la apertura';
}

export function validarContrasena(contrasena: string): string | null {
  return contrasena.length >= 6 ? null : 'Mínimo 6 caracteres';
}
