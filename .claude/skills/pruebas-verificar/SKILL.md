---
name: pruebas-verificar
description: Usar antes de dar por terminada cualquier tarea de código.
---

1. Corré `npx tsc --noEmit`. Cero errores.
2. Corré `npx expo lint`. Cero errores.
3. Revisá que no haya claves escritas en el código ni `console.log` olvidados.
4. Dale al usuario una lista corta de pasos para probarlo en el teléfono:
   - qué pantalla abrir,
   - qué hacer,
   - qué debería ver.
5. No marques la tarea como hecha hasta que el usuario confirme que funciona.
