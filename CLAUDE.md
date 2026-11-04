# TurnosYa!

App móvil Android para reservar turnos en un complejo de canchas de fútbol sintético. Proyecto académico (3.er año, Desarrollo de Software). Entrega final: 18/11/2026.

## Stack
- React Native + Expo + Expo Router, TypeScript estricto.
- Supabase: PostgreSQL + Auth (email/contraseña).
- expo-notifications para recordatorios locales.
- Destino: solo Android. Build release: APK.

## Reglas de trabajo (obligatorias)
1. **No asumas.** Si algo no está en `docs/`, preguntá antes de decidir.
2. Una tarea por vez. Al terminar, resumí qué hiciste y qué falta.
3. Antes de instalar una dependencia, decí cuál y por qué.
4. Nunca escribas claves en el código. Se usa `.env` (ver `.env.example`).
5. El SQL no se ejecuta desde acá: se escribe en `supabase/migrations/` y el usuario lo corre en el SQL Editor de Supabase.
6. Textos de la app en español rioplatense (voseo): "Reservá", "Iniciá sesión".
7. Al cerrar cada tarea, usá el skill `doc-bitacora`.
8. También se lee `AGENTS.md` para las reglas de Expo.

## Documentación (leé solo lo que la tarea necesite)
| Tema | Archivo |
| --- | --- |
| Qué hace la app | `docs/producto/requisitos.md` |
| Reglas de reservas | `docs/producto/reglas-negocio.md` |
| Carpetas y capas | `docs/tecnico/arquitectura.md` |
| Tablas y seguridad | `docs/tecnico/modelo-datos.md` |
| Estilo de código | `docs/tecnico/convenciones.md` |
| Colores y UI | `docs/diseno/guia-visual.md` |
| Hitos y tareas | `docs/proceso/plan-hitos.md` |
| Bitácora | `docs/proceso/bitacora.md` |
| Sugerencias del docente | `docs/proceso/sugerencias.md` |
| Pruebas en dispositivos | `docs/proceso/pruebas-dispositivos.md` |

## Skills
`diseno-*` UI · `datos-*` base de datos y servicios · `pruebas-*` verificación · `doc-*` documentación · `build-*` compilación.
