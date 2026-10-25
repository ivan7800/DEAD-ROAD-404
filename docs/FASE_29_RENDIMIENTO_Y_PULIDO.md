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

## Resultados medidos en Chromium CI (2026-10-25)

Ejecución aprobada: https://github.com/ivan7800/DEAD-ROAD-404/actions/runs/40225004632

| Métrica | F28, v0.21.1 | F29, v0.21.2 | Cobertura |
| --- | ---: | ---: | --- |
| Draw calls, menú PSX | 348 | 83 | Misma prueba automatizada de portada a 240p, números del panel F3 |
| Triángulos, menú PSX | 6.056 | 7.304 | Aumentan por la fusión espacial de geometrías y su visibilidad/culling |
| Número de meshes fusionadas | 20 | 576 | Recuento acumulado de fusiones reportado por la escena |
| FPS de juego activo (exploración inicial) | No registrado en F28 | 21,1 | Chromium headless con SwiftShader; **no hay comparación A/B de FPS** |
| 1 % bajo activo | No registrado | 5,0 FPS | Mismo escenario que la medición activa F29 |
| Draw calls en exploración activa | No registrado | 17 | Tras entrar en la estación en el test Chromium |

**Lectura técnica:** 348 → 83 draw calls equivale a una reducción observada de aproximadamente **76,1 %** en portada, y 20 → 576 fusionadas refleja la causa. Los FPS de portada F29 figuran como 0 porque el medidor se reinicia deliberadamente cuando no hay gameplay activo: no compararlos con el valor antiguo de portada F28 (35,9 FPS). Los datos de exploración no permiten afirmar mejora real de FPS frente a F28 ni rendimiento suficiente en hardware. El aumento de triángulos del menú es un compromiso que merece seguimiento.

`npm test` dio **264/264**, TypeScript/Vite pasó y `npm run smoke` recorrió las secuencias de capítulos V y VI, salvado, combate y controles.

## Prueba manual pendiente en Windows y Linux

Ejecutar la misma versión y escena desde cada equipo, con Chrome/Chromium actualizado, resolución de ventana 1280×800, calidad PSX 240p, sin otras aplicaciones pesadas y tras una breve estabilización de la escena. Abrir F3 durante **exploración**, registrar FPS móvil y 1 % bajo durante varios minutos de movimiento y combate, repetir el recorrido tres veces y conservar CPU/GPU, tipo de aceleración WebGL, versión de navegador, fecha, resoluciones y posibles caídas o bloqueos. Repetir con 288p y 360p. No tratar SwiftShader como equivalente a GPU física.

El pase manual debe cubrir visualmente los seis capítulos (posición de objetos, iluminación, legibilidad de pistas y tamaños de fuente), opciones de contraste y movimiento reducido, guardado/carga, cuatro finales, cierre y reentrada de diálogos, y juego prolongado. Si se observan FPS sostenidos por debajo de 45 o caídas importantes, no cerrar la incidencia de rendimiento.

## Limitaciones y trabajo siguiente

No hay evidencia de rendimiento con GPU física ni confirmación visual manual de las capturas del runner; la ruta Chromium prueba interacción y estado, no calidad estética subjetiva. El flujo CI usa `npm install` sin lockfile, pendiente de hacer la instalación reproducible mediante lockfile y `npm ci` en una fase posterior.
