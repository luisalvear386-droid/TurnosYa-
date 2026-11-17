# Requisitos

Un solo complejo, varias canchas. Dos roles: `jugador` y `admin`.

## Jugador
- Registrarse (nombre, DNI y contraseña) e iniciar sesión (DNI y contraseña). Ninguna pantalla pide ni muestra un correo.
- Ver la grilla de horarios libres por día y por cancha.
- Reservar un turno libre (confirmación inmediata).
- Ver sus reservas y cancelarlas.
- Recibir un recordatorio local 1 hora antes del partido.

## Admin
- CRUD de canchas (alta, listado, edición, baja).
- Configurar días y horarios de atención.
- Ver la agenda del día, con el nombre y el DNI de cada jugador para verificarlo en persona.
- Cargar reservas manuales (turnos pedidos por teléfono), con nombre del cliente.

## Pantallas
| Pantalla | Rol |
| --- | --- |
| Login | todos |
| Registro | todos |
| Reservar (grilla) | jugador |
| Mis reservas | jugador |
| Agenda del día | admin |
| Canchas (lista + formulario) | admin |
| Horarios de atención | admin |

## Requisitos de la cátedra
- 4+ pantallas con navegación y validación de formularios.
- Al menos un CRUD completo (canchas).
- Un recurso del dispositivo (notificaciones locales).
- Identidad: nombre "TurnosYa!", applicationId `com.turnosya.app`, versión 1.0.0, ícono propio.
- APK release instalado en 2 dispositivos.

## Fuera de alcance
Pagos, varios complejos, iOS, notificaciones push desde servidor, publicación en Google Play.
