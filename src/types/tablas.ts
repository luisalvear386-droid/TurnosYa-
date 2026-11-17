// Tipos de las tablas de docs/tecnico/modelo-datos.md.

export type Rol = 'jugador' | 'admin';

export type Perfil = {
  id: string;
  nombre: string;
  /** 7 u 8 números. Solo lo ven el propio jugador y el admin. */
  dni: string;
  rol: Rol;
  created_at: string;
};

export type Cancha = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  created_at: string;
};

export type HorarioAtencion = {
  id: string;
  /** 0 = domingo … 6 = sábado. */
  dia_semana: number;
  /** Formato "HH:MM:SS". */
  hora_apertura: string;
  /** Formato "HH:MM:SS". */
  hora_cierre: string;
};

export type EstadoReserva = 'confirmada' | 'cancelada_jugador' | 'cancelada_admin';

export type Reserva = {
  id: string;
  cancha_id: string;
  /** Null en las reservas manuales. */
  jugador_id: string | null;
  /** Obligatorio si jugador_id es null. */
  nombre_cliente: string | null;
  /** Formato "AAAA-MM-DD". */
  fecha: string;
  /** Formato "HH:MM:SS". */
  hora_inicio: string;
  estado: EstadoReserva;
  creada_por: string;
  created_at: string;
};

/** Fila que devuelve la función turnos_ocupados: sin datos personales. */
export type TurnoOcupado = Pick<Reserva, 'cancha_id' | 'fecha' | 'hora_inicio'>;

/** Reserva con el nombre de su cancha. */
export type ReservaConCancha = Reserva & {
  cancha: Pick<Cancha, 'nombre'> | null;
};

/** Reserva de la agenda del admin: con la cancha y el nombre y DNI del jugador (null si es manual). */
export type ReservaDeAgenda = ReservaConCancha & {
  jugador: Pick<Perfil, 'nombre' | 'dni'> | null;
};
