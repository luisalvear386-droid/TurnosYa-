---
name: build-apk
description: Usar al preparar la identidad de la app o generar el APK release.
---

1. Verificá en `app.json`: `name` "TurnosYa!", `android.package` `com.turnosya.app`, `version`, ícono y splash.
2. El `android.package` no se cambia después del primer build.
3. En `eas.json`, perfil `preview` con `"android": { "buildType": "apk" }`.
4. Las variables `EXPO_PUBLIC_*` tienen que llegar al build (variables de entorno de EAS o `env` en `eas.json`). Sin eso, la app compila pero no conecta.
5. Comando para el usuario: `eas build -p android --profile preview`. Vos no lo ejecutás.
6. Si la cola de EAS demora, plan B: compilación local con Gradle. Explicala paso a paso.
7. Registrá el build en la bitácora.
