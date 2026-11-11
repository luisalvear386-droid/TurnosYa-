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
    index.tsx            ruta raíz: redirige según sesión y rol; carga del perfil, o error con reintento
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
- Nunca correr `npm run reset-project` (`scripts/reset-project.js`): mueve o borra `src/` y `scripts/` completos.

## Navegación
- La ruta raíz (`index.tsx`) no lleva guard y redirige a la pantalla que corresponde:
- Sin sesión → `(auth)`: Login.
- Rol `jugador` → `(jugador)` con tabs: Reservar · Mis reservas. Abre en Reservar.
- Rol `admin` → `(admin)` con tabs: Agenda · Canchas · Horarios. Abre en Agenda.
- El rol se lee de `profiles.rol` al iniciar sesión. Un cambio de rol se ve al volver a entrar.
- "Cerrá sesión" está en el encabezado de las tabs de los dos roles.
