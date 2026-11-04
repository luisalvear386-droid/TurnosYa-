---
name: datos-servicio
description: Usar al crear o modificar un servicio en src/services o un hook que lo consume.
---

1. Solo `src/services/` importa el cliente de `src/lib/supabase.ts`.
2. Cada función devuelve `{ data, error }`, con `error` como mensaje en español para el usuario.
3. Traducí errores conocidos. Ej.: código `23505` en reservas → "Ese turno se acaba de ocupar. Elegí otro."
4. Tipos de `src/types`. Prohibido `any`.
5. El hook expone `{ datos, cargando, error, recargar }`.
6. Las reglas de negocio las valida la base (RLS, índices, RPC); la app solo las refleja.
