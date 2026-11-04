# Convenciones

- TypeScript estricto. Prohibido `any`.
- Componentes funcionales con hooks.
- Nombres del dominio en español, igual que la base: `cancha`, `reserva`, `obtenerCanchas()`.
- Archivos: componentes en `PascalCase.tsx`, el resto en `camelCase.ts`.
- Colores y espaciados solo desde `src/theme`. Nada de valores sueltos.
- Todo error se muestra al usuario en español, nunca el mensaje técnico crudo.
- Variables de entorno con prefijo `EXPO_PUBLIC_` en `.env` (no se sube a Git).
- Commits: `tipo: descripción corta` (`feat`, `fix`, `docs`, `chore`). Uno por tarea terminada.
