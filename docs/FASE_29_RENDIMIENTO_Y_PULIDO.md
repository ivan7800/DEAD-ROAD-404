# DEAD ROAD 404 — Fase 29: rendimiento y pulido

Base comprobada: `main` v0.21.1, commit `5937ff64636d7089aa0bc59624efcb86442a614c`.

## Objetivo y alcance
Optimizar el renderizado de la web PSX sin cambiar escenas jugables, físicas, mecánicas, decisiones, interfaz o clave de guardado. Separar evidencia de CI con SwiftShader y desempeño de GPU real. REA se ha consultado como procedimiento en la documentación del proyecto; no se ha ejecutado en esta revisión, que usa código fuente y pruebas propias.

### Cambios propuestos
- Una única pasada adicional de fusión de mallas estáticas **después** de convertir materiales estándar a Lambert cuantizados. Sólo hijos directos de `legacyEnvironment` y grupos `scenery` de los seis escenarios; nunca enemigos, objetos de misión o objetos animados. Grupos de materiales transparentes o texturizados continúan independientes.
- `RenderPacer`: dibujado completo durante conducción/exploración interactiva, ~12 FPS en menú/diálogos/pausa, sin WebGL cuando la pestaña está oculta. La lógica y el teclado se conservan; el cronómetro FPS pasa a medir únicamente juego activo.
- Pruebas de agrupación por apariencia y celda espacial, exclusión de transparencias e interactivos, rendimiento de la máquina de estados del renderizado y ruta real Chromium de capítulos V–VI.

### Criterios y límites
1. `npm test` y `npm run build`.
2. `node scripts/check-pages-build.mjs`.
3. `npm run smoke` completo: narrativa, controles, puzzles, combate y guardado, sin excepciones.
4. Comparar **draw calls** y triángulos bajo el mismo entorno CI, ventana, cámara y preset. Las medias de FPS entre ejecuciones no constituyen prueba causal sin controlar temperatura, GPU, resolución, carga del runner o escena.
5. Validación manual pendiente en GPU Windows y Linux, 1 % bajo, accesibilidad ampliada, partidas prolongadas y 4 finales.

**Línea de referencia observada, NO benchmark A/B controlado:** v0.21.1 CI F28 40223089249 reportó 35,9 FPS promedio móvil, 10 FPS 1 % bajo, 348 draw calls y 6056 triángulos, SwiftShader a 240p. Publicar una mejora de FPS sólo cuando haya comparación reproducible.
