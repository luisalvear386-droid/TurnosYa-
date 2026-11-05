# Arquitectura

Tres capas. Cada una solo habla con la de abajo:

```
Pantallas (src/app/)  →  Hooks (src/hooks)  →  Servicios (src/services)  →  Supabase
```

- **Pantallas:** muestran datos y capturan acciones. Nunca importan `supabase`.
- **Hooks:** estado de la pantalla (cargando, error, datos).
- **Servicios:** única capa que consulta Supabase. Devuelven `{ data, error }` con mensajes en español.

## Carpetas
```
src/
  app/                   solo rutas (Expo Router)
    _layout.tsx          sesión + redirección por rol
    (auth)/login.tsx
    (auth)/registro.tsx
    (jugador)/_layout.tsx     tabs del jugador
    (jugador)/reservar.tsx
    (jugador)/mis-reservas.tsx
    (admin)/_layout.tsx       tabs del admin
    (admin)/agenda.tsx
    (admin)/canchas/index.tsx
    (admin)/canchas/[id].tsx  "nuevo" = alta, id = edición
    (admin)/horarios.tsx
  lib/supabase.ts        cliente (guía oficial Supabase + Expo)
  services/              auth, canchas, horarios, reservas
  hooks/
  components/            Boton, Campo, Tarjeta…
  theme/                 colores y espaciados (ver guia-visual.md)
  types/                 tipos de las tablas
  utils/                 fechas, validaciones
assets/                  imágenes, ícono y splash
supabase/migrations/     SQL numerado: 001_..., 002_...
```

## Rutas e imports
- Cada archivo dentro de `src/app/` es una pantalla y cada `_layout.tsx` define un navegador. Lo que no sea ruta (componentes, hooks, utilidades) va fuera de `src/app/`.
- Alias de imports (`tsconfig.json`): `@/` apunta a `src/` y `@/assets/` apunta a `assets/`.

## Código de la plantilla
- El código de ejemplo de la plantilla de Expo ya se quitó de `src/`. El ícono y el splash quedan hasta la tarea 4.1.
- `src/app/index.tsx` es una pantalla provisoria para quien inició sesión: muestra nombre y rol, y permite cerrar sesión. Se reemplaza en la tarea 2.5.
- Nunca correr `npm run reset-project` (`scripts/reset-project.js`): mueve o borra `src/` y `scripts/` completos.

## Navegación
- Sin sesión → `(auth)`.
- Rol `jugador` → `(jugador)` con tabs: Reservar · Mis reservas.
- Rol `admin` → `(admin)` con tabs: Agenda · Canchas · Horarios.
- El rol se lee de `profiles.rol`.
