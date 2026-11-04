---
name: diseno-pantalla
description: Usar al crear o modificar una pantalla de la app (archivos en src/app/).
---

1. Leé `docs/diseno/guia-visual.md` y la sección de la pantalla en `docs/producto/requisitos.md`.
2. Colores y espaciados solo desde `src/theme`.
3. La pantalla no importa `supabase`: usa un hook de `src/hooks`.
4. Incluí los tres estados: cargando, vacío y error (con mensaje en español).
5. Reutilizá componentes de `src/components` antes de crear uno nuevo.
6. Áreas táctiles de 48 de alto como mínimo. Textos con voseo.
7. Al terminar, decí cómo probarla: qué abrir y qué tocar.
