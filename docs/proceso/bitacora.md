# Bitácora de avances

Una fila por tarea cerrada, la más reciente arriba.

| Fecha | Tarea | Qué se hizo | Error encontrado | Solución | Commit |
| --- | --- | --- | --- | --- | --- |
| 04/11/2026 | 2.1 Estructura de carpetas, tema de colores y cliente de Supabase (probada en Poco M6: "Conectado a Supabase") | Se quitaron los ejemplos de la plantilla; carpetas, `src/theme` y `src/lib/supabase.ts`; ESLint configurado; pantalla provisoria de conexión; modo claro; skills y `CLAUDE.md` ajustados | 1) `npx expo lint` falló al instalar: npm devolvió 404 para `metro-0.87.3`. 2) El lint marcó `setState` síncrono dentro de un efecto en `useConexion`. 3) En el teléfono, una URL mal escrita en `.env` hizo que `createClient` lanzara una excepción al importar el módulo y se cayera toda la app | 1) El paquete existía en el registro; la instalación siguiente completó las dependencias y `npx expo lint` generó la configuración. 2) Se reescribió el hook sin desactivar la regla. 3) Se captura la excepción al crear el cliente y la pantalla muestra "Falta configurar Supabase"; se corrigió la URL del `.env` | Pendiente |
| 04/11/2026 | 0. Alinear la documentación con la plantilla de Expo SDK 58 | `arquitectura.md` con rutas en `src/app/`; regla en `CLAUDE.md` para leer también `AGENTS.md` | La documentación ubicaba las rutas en `app/`, pero la plantilla las trae en `src/app/` | Se actualizó `arquitectura.md` | 91685bb |
