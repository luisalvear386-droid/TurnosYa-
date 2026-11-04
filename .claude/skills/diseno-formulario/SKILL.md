---
name: diseno-formulario
description: Usar al crear un formulario con validación (login, registro, cancha, horarios, reserva manual).
---

1. Validá cada campo antes de enviar y mostrá el error debajo del campo.
2. Mensajes cortos en español: "Ingresá un email válido", "Mínimo 6 caracteres".
3. Botón de enviar deshabilitado mientras se guarda, con indicador de carga.
4. Si el servicio devuelve error, mostralo arriba del formulario; no borres lo escrito.
5. Teclado adecuado por campo (`email-address`, `numeric`) y que no tape los campos.
6. Validaciones reutilizables en `src/utils/validaciones.ts`.
