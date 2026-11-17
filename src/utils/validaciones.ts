// Cada validación devuelve el mensaje de error o null si el valor es correcto.

export function validarNombre(nombre: string): string | null {
  return nombre.trim() ? null : 'Ingresá tu nombre';
}

/** Solo números, 7 u 8 dígitos (igual que el check de la base). */
export function validarDni(dni: string): string | null {
  return /^[0-9]{7,8}$/.test(dni.trim()) ? null : 'Ingresá tu DNI: 7 u 8 números, sin puntos';
}

export function validarNombreCancha(nombre: string): string | null {
  return nombre.trim() ? null : 'Ingresá el nombre de la cancha';
}

export function validarNombreCliente(nombre: string): string | null {
  return nombre.trim() ? null : 'Ingresá el nombre del cliente';
}

/** Horas enteras; el cierre puede ser 24 (medianoche). */
export function validarHorario(apertura: number, cierre: number): string | null {
  return cierre > apertura ? null : 'El cierre tiene que ser después de la apertura';
}

export function validarContrasena(contrasena: string): string | null {
  return contrasena.length >= 6 ? null : 'Mínimo 6 caracteres';
}
