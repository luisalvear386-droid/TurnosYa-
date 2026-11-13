# Guía para generar e instalar el APK (tareas 3.6 y 4.2)

## Antes de empezar: qué es cada cosa

Hasta ahora la app corrió dentro de **Expo Go**, una app que interpreta nuestro código. Para entregarla hace
falta un **APK**: el archivo instalador de Android, que se instala como cualquier app y no necesita Expo Go
ni la computadora prendida.

- **EAS (Expo Application Services):** el servicio de Expo que compila el APK en sus servidores. No hace
  falta tener Android Studio. Se usa con el comando `npx eas-cli@latest …`, que no requiere instalar nada
  aparte (npx lo descarga solo).
- **`eas.json`:** el archivo de configuración de EAS. Ya está en el proyecto, con un **perfil** llamado
  `preview` que genera un APK (en lugar del formato AAB que pide Google Play).
- **Variables de entorno de EAS:** la URL y la clave de Supabase. En la computadora están en `.env`, pero ese
  archivo no se sube a Git ni a EAS. Por eso se cargan una sola vez en la cuenta de Expo (paso 3) y EAS las
  pone en el APK al compilar. Las claves **no** se escriben en `eas.json`.
- **Keystore:** la "firma" del APK. Android solo deja actualizar una app si la versión nueva tiene la misma
  firma. EAS la crea y la guarda por vos.
- **Cola:** en el plan gratuito, la compilación espera su turno en los servidores de Expo. Puede tardar de
  unos minutos a más de una hora. Mientras tanto podés cerrar la terminal: el enlace queda en expo.dev.

Necesita buena conexión. Todos los comandos se escriben en la terminal de VS Code, en la carpeta del proyecto.

## A. Con EAS (recomendado)

1. **Iniciá sesión en Expo** (si no tenés cuenta, creala gratis en expo.dev):
   ```
   npx eas-cli@latest login
   ```
   La primera vez, npx pregunta si instala `eas-cli`: respondé `y`. Después pide el email o usuario y la
   contraseña de expo.dev. Al final dice `Logged in as <tu usuario>`.
2. **Vinculá el proyecto** con tu cuenta de Expo (una sola vez):
   ```
   npx eas-cli@latest init
   ```
   Pregunta si crea el proyecto `@<tu usuario>/turnosya`: respondé `Y`. Agrega `extra.eas.projectId` y `owner`
   a `app.json`. Ese cambio se commitea.
3. **Cargá las variables de Supabase** en el entorno `preview`. Usá los mismos valores que tenés en `.env`
   (copiá lo que está después del `=`, sin espacios):
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
   - Si pregunta `Generate a new Android Keystore?`, respondé `Y`: EAS crea la firma y la guarda.
   - Después sube el proyecto y muestra un enlace a la compilación en expo.dev. Ahí se ve la cola y el avance.
   - Cuando termina (`Build finished`), muestra un enlace al APK y un código QR.
5. **Instalá en el teléfono:** escaneá el QR con la cámara (o abrí el enlace en el teléfono), descargá el APK
   y abrilo. Si Android lo pide, permití "Instalar apps desconocidas" para el navegador. Si Play Protect avisa
   que la app es desconocida, elegí instalar de todos modos (es normal en apps que no vienen de Google Play).
   La app instalada es independiente de Expo Go.

**Si algo falla**
- `env:create` dice que la variable ya existe: ya estaba cargada. Revisala con `env:list`.
- La compilación falla: abrí el enlace de expo.dev, entrá al paso marcado en rojo y copiá las últimas líneas
  del registro.
- La app instalada muestra "Falta configurar Supabase": faltan las variables del paso 3 o tienen otro nombre.
  Corregilas y compilá de nuevo.

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
4. Avisos a horario exacto: sin el permiso `SCHEDULE_EXACT_ALARM`, los avisos se programan como "bestEffort" y
   Android 12 o más nuevo puede entregarlos algunos minutos tarde. En Expo Go llegaron a horario. Si en el APK
   llegan tarde, se decide si se agrega el permiso (cambia `app.json` y obliga a compilar de nuevo).
5. Instalalo en el segundo dispositivo (tarea 4.3) y registrá el build en la bitácora (fecha, perfil, enlace o
   ruta del APK, versión).
