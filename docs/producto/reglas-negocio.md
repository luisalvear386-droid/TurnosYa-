# Reglas de negocio

## Turnos
- Duran 1 hora y empiezan en hora exacta (18:00, 19:00…).
- Solo dentro del horario de atención del día (`horarios_atencion`).
- La grilla muestra hoy y los 6 días siguientes.
- No se reservan horarios pasados.

## Reservas
- Se confirman al instante si el turno está libre.
- Nunca dos reservas `confirmada` para la misma cancha, fecha y hora. **Lo garantiza la base de datos** (índice único), no la pantalla.
- Si la base rechaza por duplicado, la app muestra: "Ese turno se acaba de ocupar. Elegí otro."
- Reserva manual del admin: sin jugador, con `nombre_cliente` obligatorio.

## Estados
`confirmada` → `cancelada_jugador` | `cancelada_admin`. No se borran reservas: se cancelan.

## Cancelación
- Jugador: solo sus reservas y hasta 2 horas antes del turno.
- Admin: cualquier reserva, en cualquier momento.

## Recordatorio
Notificación local 1 hora antes. Se programa al reservar y se cancela si se cancela la reserva. Si faltan menos de 1 hora, no se programa.

## Zona horaria
America/Argentina/Buenos_Aires. Fechas y horas se guardan como hora local (`date` + `time`).
