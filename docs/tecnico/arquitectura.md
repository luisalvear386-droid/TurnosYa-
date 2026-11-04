# Arquitectura

Tres capas. Cada una solo habla con la de abajo:

```
Pantallas (app/)  →  Hooks (src/hooks)  →  Servicios (src/services)  →  Supabase
```

- **Pantallas:** muestran datos y capturan acciones. Nunca importan `supabase`.
- **Hooks:** estado de la pantalla (cargando, error, datos).
- **Servicios:** única capa que consulta Supabase. Devuelven `{ data, error }` con mensajes en español.

## Carpetas
```
app/
  _layout.tsx            sesión + redirección por rol
  (auth)/login.tsx
  (auth)/registro.tsx
  (jugador)/reservar.tsx
  (jugador)/mis-reservas.tsx
  (admin)/agenda.tsx
  (admin)/canchas/index.tsx
  (admin)/canchas/[id].tsx    "nuevo" = alta, id = edición
  (admin)/horarios.tsx
src/
  lib/supabase.ts        cliente (guía oficial Supabase + Expo)
  services/              auth, canchas, horarios, reservas
  hooks/
  components/            Boton, Campo, Tarjeta…
  theme/                 colores y espaciados (ver guia-visual.md)
  types/                 tipos de las tablas
  utils/                 fechas, validaciones
supabase/migrations/     SQL numerado: 001_..., 002_...
```

## Navegación
- Sin sesión → `(auth)`.
- Rol `jugador` → `(jugador)` con tabs: Reservar · Mis reservas.
- Rol `admin` → `(admin)` con tabs: Agenda · Canchas · Horarios.
- El rol se lee de `profiles.rol`.
