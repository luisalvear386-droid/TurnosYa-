# Pruebas en dispositivos

## Dispositivos
| # | Tipo | Modelo | Versión de Android | Pantalla |
| --- | --- | --- | --- | --- |
| 1 | físico | Poco M6 | (a confirmar) | |
| 2 | físico / emulador | | | |

## Casos de prueba
| Caso | Disp. 1 | Disp. 2 | Diferencias observadas |
| --- | --- | --- | --- |
| Instalar el APK | | | |
| Registro e inicio de sesión | | | |
| Reservar un turno | | | |
| Doble reserva del mismo turno (dos dispositivos a la vez) | OK en Expo Go (12/11): un solo teléfono más el SQL `supabase/pruebas/reserva-manual-de-prueba.sql` en lugar del segundo dispositivo; apareció "Ese turno se acaba de ocupar. Elegí otro." | | Falta repetirla con el APK y dos dispositivos |
| Cancelar una reserva | | | |
| Recibir el recordatorio | | | |
| CRUD de canchas (admin) | | | |
| Rotar pantalla / volver de segundo plano | | | |
| Sin conexión a internet | | | |

Resultado: OK · Falla (detalle) · N/A. Adjuntar capturas en `docs/proceso/capturas/`.
