# Pruebas en dispositivos

## Dispositivos
| # | Tipo | Modelo | Versión de Android | Pantalla |
| --- | --- | --- | --- | --- |
| 1 | físico | Xiaomi Poco M6 | 14 | |
| 2 | físico | Samsung Galaxy A15 | 14 | |

Las dos pruebas se hicieron con el APK 1.0.0 (build de EAS del 12/11/2026, perfil `preview`).

## Casos de prueba
| Caso | Disp. 1 | Disp. 2 | Diferencias observadas |
| --- | --- | --- | --- |
| Instalar el APK | OK | OK | Ninguna |
| Registro e inicio de sesión | OK | OK | Ninguna |
| Reservar un turno | OK | OK | Ninguna |
| Doble reserva del mismo turno (dos dispositivos a la vez) | OK | OK | Ninguna. Antes, el 12/11, se había probado en Expo Go con un teléfono y el SQL `supabase/pruebas/reserva-manual-de-prueba.sql`; apareció "Ese turno se acaba de ocupar. Elegí otro." |
| Cancelar una reserva | OK | OK | Ninguna |
| Recibir el recordatorio | OK | OK | Ninguna. En el APK se crea el canal propio "Recordatorios de partidos" y los avisos llegaron a horario: no hace falta `SCHEDULE_EXACT_ALARM` |
| CRUD de canchas (admin) | OK | OK | Ninguna. Crear, listar y editar funcionan. Eliminar "Cancha 2" no se permitió porque tenía reservas canceladas en su historial (es la regla de `reglas-negocio.md`). Mejora pendiente: el mensaje ("La cancha tiene reservas…") da a entender que hay turnos reservados; debería aclarar que cuenta todo el historial, incluidas las canceladas |
| Rotar pantalla / volver de segundo plano | OK | OK | Ninguna |
| Sin conexión a internet | OK | OK | Ninguna |

Resultado: OK · Falla (detalle) · N/A. Adjuntar capturas en `docs/proceso/capturas/`.

## Mejoras pendientes
- Mensaje al eliminar una cancha con historial: hoy dice "La cancha tiene reservas, así que no se puede eliminar…", aunque todas estén canceladas. Conviene aclarar que se cuentan las reservas pasadas y canceladas. No se cambió para la entrega (no se toca más código).
