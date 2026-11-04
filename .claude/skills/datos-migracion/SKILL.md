---
name: datos-migracion
description: Usar al crear o cambiar tablas, índices, políticas RLS, triggers o funciones SQL de Supabase.
---

1. Leé `docs/tecnico/modelo-datos.md`. Si el cambio no está ahí, preguntá antes.
2. Creá un archivo nuevo en `supabase/migrations/` con el siguiente número: `002_descripcion.sql`. Nunca edites uno ya ejecutado.
3. Toda tabla nueva lleva RLS activado y sus políticas en el mismo archivo.
4. El SQL tiene que poder correrse entero en el SQL Editor sin errores.
5. No lo ejecutes. Decile al usuario: "Copiá el contenido de `<archivo>` en Supabase > SQL Editor y tocá Run". Esperá su confirmación.
6. Si el cambio afecta tablas, actualizá `docs/tecnico/modelo-datos.md` y `src/types`.
