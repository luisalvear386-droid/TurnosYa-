# Guía para generar e instalar el APK (tareas 3.6 y 4.2)

Necesita buena conexión: se descargan herramientas y se compila en los servidores de Expo (EAS).
`eas.json` ya tiene el perfil `preview` que genera un APK. Las claves de Supabase **no** van en `eas.json`:
se cargan una sola vez como variables de entorno de EAS (paso 3).

## A. Con EAS (recomendado)

1. **Iniciá sesión en Expo** (si no tenés cuenta, creala gratis en expo.dev):
   ```
   npx eas-cli@latest login
   ```
2. **Vinculá el proyecto.** Agrega `extra.eas.projectId` y `owner` a `app.json`. Aceptá y commiteá ese cambio:
   ```
   npx eas-cli@latest init
   ```
3. **Cargá las variables de Supabase** en el entorno `preview`. Usá los mismos valores que tenés en `.env`:
   ```
   npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "<URL de .env>" --visibility plaintext
   npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<clave de .env>" --visibility sensitive
   npx eas-cli@latest env:list --environment preview
   ```
   La última línea tiene que mostrar las dos variables. Sin ellas, la app compila pero muestra "Falta configurar Supabase".
4. **Compilá:**
   ```
   npx eas-cli@latest build -p android --profile preview
   ```
   - Si pregunta si genera un keystore (la clave que firma el APK), respondé que sí: EAS la guarda.
   - En el plan gratuito puede haber cola. Al terminar muestra un enlace y un código QR.
5. **Instalá en el teléfono:** abrí el enlace o el QR, descargá el APK y abrilo. Si Android lo pide, permití
   "Instalar apps desconocidas" para el navegador. La app instalada es independiente de Expo Go.

## B. Plan B: compilación local con Gradle (si la cola de EAS demora)

Usa el Android Studio que ya instalaste y lee las claves del `.env` local.

1. Variables de entorno de Windows (una vez):
   - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
   - `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
2. Generá la carpeta nativa. `android/` está en `.gitignore` y **no se edita a mano**:
   ```
   npx expo prebuild -p android
   ```
3. Compilá el APK release:
   ```
   cd android
   .\gradlew.bat assembleRelease
   ```
4. El APK queda en `android\app\build\outputs\apk\release\app-release.apk`. Pasalo al teléfono por USB o
   instalalo con `adb install`. Lo firma la clave de depuración de la plantilla: sirve para instalarlo en
   los teléfonos de prueba (la app no se publica en Google Play).

## 3.6 Primera instalación en un dispositivo

Con el APK instalado en el Poco M6, revisá:
1. En el cajón de apps: el ícono de la pelota sobre fondo verde y el nombre "TurnosYa!".
2. Al abrir: el splash verde con el logo.
3. Iniciá sesión como jugador, reservá un turno y mirá Mis reservas. Cerrá sesión.
4. Iniciá sesión como admin y abrí Agenda, Canchas y Horarios.
5. **Canal de recordatorios** (nota de la 4.2): reservá un turno que empiece en más de 1 hora y andá a
   Ajustes > Apps > TurnosYa! > Notificaciones. Si aparece la categoría "Recordatorios de partidos", el canal
   propio se crea bien en el APK. Si no aparece, los avisos usan el canal por defecto, igual que en Expo Go.
6. Anotá el resultado en `docs/proceso/pruebas-dispositivos.md` (dispositivo 1) y en la bitácora.

## 4.2 APK release

1. Confirmá en `app.json`: `name` "TurnosYa!", `android.package` `com.turnosya.app` (no se cambia nunca más),
   `version` 1.0.0, `android.versionCode` 1.
2. Si el APK de la 3.6 se generó con la identidad final (4.1 cerrada) y sin cambios de código posteriores,
   ese mismo APK sirve. Si hubo cambios, repetí el paso 4 de A (o los pasos de B).
3. Revisá la nota del canal de recordatorios (paso 5 de la 3.6).
4. Avisos a horario exacto: sin el permiso `SCHEDULE_EXACT_ALARM`, Android 12 o más nuevo puede entregar el
   recordatorio algunos minutos tarde. Si en el APK pasa, se decide si se agrega el permiso.
5. Instalalo en el segundo dispositivo (tarea 4.3) y registrá el build en la bitácora (fecha, perfil, enlace o
   ruta del APK, versión).
