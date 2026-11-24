# TurnosYa!

Aplicación para consultar y reservar turnos en canchas sintéticas. Incluye acceso para jugadores y herramientas de administración del complejo.

## Funcionalidades

- Registro e inicio de sesión de jugadores.
- Consulta de canchas, horarios y turnos disponibles.
- Reserva y consulta de turnos propios.
- Recordatorios locales antes de un turno confirmado.
- Panel de administración para gestionar canchas, horarios y reservas, incluidas reservas manuales.

## Tecnologías

- React Native y Expo
- TypeScript y Expo Router
- Supabase para autenticación y base de datos

## Requisitos

- Node.js y npm
- Un proyecto de Supabase con acceso a su URL y clave pública (anon/publishable)
- Expo Go o un emulador para ejecutar la aplicación

## Configuración

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone https://github.com/luisalvear386-droid/TurnosYa-.git
   cd TurnosYa-
   npm ci
   ```

2. Crea el archivo local de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell también puedes usar `Copy-Item .env.example .env`.

3. Edita `.env` y completa los valores de tu proyecto Supabase:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica
   ```

   No incluyas claves `service_role` ni publiques el archivo `.env`.

4. Configura la base de datos ejecutando las migraciones SQL de `supabase/migrations/` en orden. La migración `004a` solo muestra cuentas antiguas y reservas afectadas. **Revisa ese resultado antes de ejecutar `004b`**, ya que elimina reservas asociadas a cuentas sin DNI. Ejecuta `005` después de completar la migración de esas cuentas.

## Ejecutar la aplicación

```bash
npx expo start
```

Desde la terminal de Expo puedes abrir la app en Android, iOS o web. También están disponibles:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Archivos del proyecto

- `src/`: pantallas, componentes, hooks y servicios de la aplicación.
- `supabase/migrations/`: esquema y cambios de la base de datos.
- `assets/`: íconos, imágenes y recursos visuales.
- `Informe e Apk/`: APK de Android e informe del proyecto.

Puedes encontrar el [APK y el informe en GitHub](https://github.com/luisalvear386-droid/TurnosYa-/tree/master/Informe%20e%20Apk).
